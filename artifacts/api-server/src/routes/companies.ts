import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  companies, categories, companyCategories,
  communities, companyCommunities, systemSettings, auditLogs,
} from "@workspace/db/schema";
import { eq, and, isNull, ilike, or, count, sql } from "drizzle-orm";
import { withAuth, withRole, type AuthRequest } from "../lib/auth";
import { stripe } from "../lib/stripe";

const router: IRouter = Router();

async function getSetting(key: string): Promise<string | null> {
  const [s] = await db.select({ value: systemSettings.value })
    .from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  return s?.value ?? null;
}

router.get("/companies", async (req: AuthRequest, res) => {
  try {
    const { community_id, category_id, page = "1", limit = "20", q } = req.query as any;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = db.select({
      id: companies.id,
      name: companies.name,
      description: companies.description,
      city: companies.city,
      state: companies.state,
      imageUrl: companies.imageUrl,
      isClaimed: companies.isClaimed,
      status: companies.status,
      categoryId: companies.categoryId,
    }).from(companies).where(isNull(companies.deletedAt)).$dynamic();

    if (community_id) {
      query = query.innerJoin(companyCommunities,
        and(eq(companyCommunities.companyId, companies.id), eq(companyCommunities.communityId, community_id))
      ) as any;
    }

    if (category_id) {
      query = query.innerJoin(companyCategories,
        and(eq(companyCategories.companyId, companies.id), eq(companyCategories.categoryId, category_id))
      ) as any;
    }

    if (q) {
      query = query.where(and(isNull(companies.deletedAt), ilike(companies.name, `%${q}%`))) as any;
    }

    const results = await (query as any).limit(limitNum).offset(offset);

    const [total] = await db.select({ count: count() }).from(companies).where(isNull(companies.deletedAt));

    res.json({ companies: results, total: total.count, page: pageNum, limit: limitNum });
  } catch (error: any) {
    console.error("Failed to list companies:", error.message);
    res.status(500).json({ error: "Failed to list companies" });
  }
});

router.get("/companies/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const [company] = await db.select({
      id: companies.id,
      name: companies.name,
      description: companies.description,
      website: companies.website,
      phone: companies.phone,
      imageUrl: companies.imageUrl,
      city: companies.city,
      state: companies.state,
      isClaimed: companies.isClaimed,
      claimedByUserId: companies.claimedByUserId,
      status: companies.status,
      categoryId: companies.categoryId,
    }).from(companies).where(and(eq(companies.id, id), isNull(companies.deletedAt))).limit(1);

    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    const cats = await db.select({
      id: categories.id,
      name: categories.name,
    }).from(companyCategories)
      .innerJoin(categories, eq(categories.id, companyCategories.categoryId))
      .where(eq(companyCategories.companyId, id));

    if (company.categoryId && cats.length === 0) {
      const [legacyCat] = await db.select({ id: categories.id, name: categories.name })
        .from(categories).where(eq(categories.id, company.categoryId)).limit(1);
      if (legacyCat) cats.push(legacyCat);
    }

    const comms = await db.select({
      id: communities.id,
      name: communities.name,
      displayName: communities.displayName,
      state: communities.state,
    }).from(companyCommunities)
      .innerJoin(communities, eq(communities.id, companyCommunities.communityId))
      .where(eq(companyCommunities.companyId, id));

    res.json({ company, categories: cats, communities: comms });
  } catch (error: any) {
    console.error("Failed to get company:", error.message);
    res.status(500).json({ error: "Failed to get company" });
  }
});

router.post("/companies/:id/claim", withAuth(), withRole(["company"]), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [company] = await db.select().from(companies)
      .where(and(eq(companies.id, id), isNull(companies.deletedAt))).limit(1);

    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    if (company.claimedByUserId || company.isClaimed) {
      res.status(400).json({ error: "This company has already been claimed" });
      return;
    }

    const existingClaim = await db.select({ id: companies.id }).from(companies)
      .where(and(eq(companies.claimedByUserId, userId), isNull(companies.deletedAt))).limit(1);

    const claimFeeCents = parseInt(await getSetting("company.claim_fee_cents") || "500");
    const isFirstClaim = existingClaim.length === 0;

    if (isFirstClaim) {
      await db.update(companies).set({
        claimedByUserId: userId,
        claimedAt: new Date(),
        isClaimed: true,
        status: "active",
        userId: userId,
        updatedAt: new Date(),
      }).where(eq(companies.id, id));

      await db.insert(auditLogs).values({
        userId,
        action: "company_claimed",
        entityType: "company",
        entityId: id,
        metadata: { free: true, firstClaim: true },
      });

      res.json({ claimed: true });
      return;
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      res.status(500).json({ error: "Payment processing is not configured" });
      return;
    }

    const baseUrl = `https://${req.get("host")}`;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: "Business Claim Fee" },
          unit_amount: claimFeeCents,
        },
        quantity: 1,
      }],
      metadata: {
        type: "company_claim",
        company_id: id,
        user_id: userId,
      },
      success_url: `${baseUrl}/company/${id}?claimed=true`,
      cancel_url: `${baseUrl}/company/${id}?claimed=cancelled`,
    });

    res.json({ checkoutUrl: session.url });
  } catch (error: any) {
    console.error("Claim failed:", error.message);
    res.status(500).json({ error: "Failed to process claim" });
  }
});

router.get("/company/profile", withAuth(), withRole(["company"]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const [company] = await db.select().from(companies)
      .where(and(eq(companies.claimedByUserId, userId), isNull(companies.deletedAt))).limit(1);

    if (!company) {
      res.status(404).json({ error: "No claimed company found" });
      return;
    }

    const cats = await db.select({
      id: categories.id,
      name: categories.name,
    }).from(companyCategories)
      .innerJoin(categories, eq(categories.id, companyCategories.categoryId))
      .where(eq(companyCategories.companyId, company.id));

    const comms = await db.select({
      id: communities.id,
      name: communities.name,
      displayName: communities.displayName,
      state: communities.state,
    }).from(companyCommunities)
      .innerJoin(communities, eq(communities.id, companyCommunities.communityId))
      .where(eq(companyCommunities.companyId, company.id));

    res.json({ company, categories: cats, communities: comms });
  } catch (error: any) {
    console.error("Failed to get profile:", error.message);
    res.status(500).json({ error: "Failed to get company profile" });
  }
});

router.put("/company/profile", withAuth(), withRole(["company"]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { name, description, website, phone, street, city, state, zip } = req.body;

    if (!name?.trim()) {
      res.status(400).json({ error: "Business name is required" });
      return;
    }

    if (description && description.length > 500) {
      res.status(400).json({ error: "Description cannot exceed 500 characters" });
      return;
    }

    const [company] = await db.select({ id: companies.id }).from(companies)
      .where(and(eq(companies.claimedByUserId, userId), isNull(companies.deletedAt))).limit(1);

    if (!company) {
      res.status(404).json({ error: "No claimed company found" });
      return;
    }

    const [updated] = await db.update(companies).set({
      name: name.trim(),
      description: description?.trim() || null,
      website: website?.trim() || null,
      phone: phone?.trim() || null,
      street: street?.trim() || null,
      city: city?.trim() || null,
      state: state?.trim() || null,
      zip: zip?.trim() || null,
      updatedAt: new Date(),
      updatedBy: userId,
    }).where(eq(companies.id, company.id)).returning();

    res.json({ company: updated });
  } catch (error: any) {
    console.error("Failed to update profile:", error.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.put("/company/profile/categories", withAuth(), withRole(["company"]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { categoryIds } = req.body;

    if (!Array.isArray(categoryIds) || categoryIds.length > 5) {
      res.status(400).json({ error: "Select up to 5 categories" });
      return;
    }

    const [company] = await db.select({ id: companies.id }).from(companies)
      .where(and(eq(companies.claimedByUserId, userId), isNull(companies.deletedAt))).limit(1);

    if (!company) {
      res.status(404).json({ error: "No claimed company found" });
      return;
    }

    await db.delete(companyCategories).where(eq(companyCategories.companyId, company.id));

    if (categoryIds.length > 0) {
      await db.insert(companyCategories).values(
        categoryIds.map((catId: string) => ({ companyId: company.id, categoryId: catId }))
      );
    }

    const cats = await db.select({
      id: categories.id,
      name: categories.name,
    }).from(companyCategories)
      .innerJoin(categories, eq(categories.id, companyCategories.categoryId))
      .where(eq(companyCategories.companyId, company.id));

    res.json({ categories: cats });
  } catch (error: any) {
    console.error("Failed to update categories:", error.message);
    res.status(500).json({ error: "Failed to update categories" });
  }
});

router.get("/company/communities", withAuth(), withRole(["company"]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const [company] = await db.select({ id: companies.id }).from(companies)
      .where(and(eq(companies.claimedByUserId, userId), isNull(companies.deletedAt))).limit(1);

    if (!company) {
      res.status(404).json({ error: "No claimed company found" });
      return;
    }

    const comms = await db.select({
      id: communities.id,
      name: communities.name,
      displayName: communities.displayName,
      state: communities.state,
      isPrimary: companyCommunities.isPrimary,
    }).from(companyCommunities)
      .innerJoin(communities, eq(communities.id, companyCommunities.communityId))
      .where(eq(companyCommunities.companyId, company.id));

    res.json({ communities: comms });
  } catch (error: any) {
    console.error("Failed to get communities:", error.message);
    res.status(500).json({ error: "Failed to get communities" });
  }
});

router.post("/company/communities/add", withAuth(), withRole(["company"]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { communityId } = req.body;

    if (!communityId) {
      res.status(400).json({ error: "Community ID is required" });
      return;
    }

    const [company] = await db.select({ id: companies.id }).from(companies)
      .where(and(eq(companies.claimedByUserId, userId), isNull(companies.deletedAt))).limit(1);

    if (!company) {
      res.status(404).json({ error: "No claimed company found" });
      return;
    }

    const existing = await db.select({ id: companyCommunities.id }).from(companyCommunities)
      .where(and(eq(companyCommunities.companyId, company.id), eq(companyCommunities.communityId, communityId))).limit(1);

    if (existing.length > 0) {
      res.status(400).json({ error: "Community already added" });
      return;
    }

    const currentComms = await db.select({ id: companyCommunities.id }).from(companyCommunities)
      .where(eq(companyCommunities.companyId, company.id));

    const isFirst = currentComms.length === 0;

    if (isFirst) {
      await db.insert(companyCommunities).values({
        companyId: company.id,
        communityId,
        isPrimary: true,
        paid: false,
      });
      res.json({ added: true });
      return;
    }

    const addFeeCents = parseInt(await getSetting("company.community_add_fee_cents") || "200");

    if (!process.env.STRIPE_SECRET_KEY) {
      await db.insert(companyCommunities).values({
        companyId: company.id,
        communityId,
        isPrimary: false,
        paid: false,
      });
      res.json({ added: true });
      return;
    }

    const baseUrl = `https://${req.get("host")}`;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: "Add Community" },
          unit_amount: addFeeCents,
        },
        quantity: 1,
      }],
      metadata: {
        type: "community_add",
        company_id: company.id,
        community_id: communityId,
        user_id: userId,
      },
      success_url: `${baseUrl}/company/edit?community_added=true`,
      cancel_url: `${baseUrl}/company/edit?community_added=cancelled`,
    });

    res.json({ checkoutUrl: session.url });
  } catch (error: any) {
    console.error("Failed to add community:", error.message);
    res.status(500).json({ error: "Failed to add community" });
  }
});

router.delete("/company/communities/:communityId", withAuth(), withRole(["company"]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { communityId } = req.params;

    const [company] = await db.select({ id: companies.id }).from(companies)
      .where(and(eq(companies.claimedByUserId, userId), isNull(companies.deletedAt))).limit(1);

    if (!company) {
      res.status(404).json({ error: "No claimed company found" });
      return;
    }

    const currentComms = await db.select({ id: companyCommunities.id }).from(companyCommunities)
      .where(eq(companyCommunities.companyId, company.id));

    if (currentComms.length <= 1) {
      res.status(400).json({ error: "Cannot remove the last community. Minimum 1 required." });
      return;
    }

    await db.delete(companyCommunities).where(
      and(eq(companyCommunities.companyId, company.id), eq(companyCommunities.communityId, communityId))
    );

    res.json({ removed: true });
  } catch (error: any) {
    console.error("Failed to remove community:", error.message);
    res.status(500).json({ error: "Failed to remove community" });
  }
});

router.get("/communities/search", async (req: AuthRequest, res) => {
  try {
    const { q, state: stateFilter, limit = "20" } = req.query as any;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    let conditions = [eq(communities.isCounty, true), isNull(communities.deletedAt)];

    if (q) {
      conditions.push(ilike(communities.name, `%${q}%`));
    }
    if (stateFilter) {
      conditions.push(eq(communities.state, stateFilter));
    }

    const results = await db.select({
      id: communities.id,
      name: communities.name,
      displayName: communities.displayName,
      state: communities.state,
      fipsCode: communities.fipsCode,
    }).from(communities).where(and(...conditions)).limit(limitNum);

    res.json({ communities: results });
  } catch (error: any) {
    console.error("Failed to search communities:", error.message);
    res.status(500).json({ error: "Failed to search communities" });
  }
});

router.get("/categories", async (req: AuthRequest, res) => {
  try {
    const { taxonomy } = req.query as any;
    let conditions = [isNull(categories.deletedAt), eq(categories.status, "active")];
    if (taxonomy) {
      conditions.push(eq(categories.taxonomyType, taxonomy));
    }
    const results = await db.select({
      id: categories.id,
      name: categories.name,
      taxonomyType: categories.taxonomyType,
    }).from(categories).where(and(...conditions)).orderBy(categories.sortOrder);

    res.json({ categories: results });
  } catch (error: any) {
    console.error("Failed to get categories:", error.message);
    res.status(500).json({ error: "Failed to get categories" });
  }
});

router.get("/company/dashboard", withAuth(), withRole(["company"]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const [company] = await db.select().from(companies)
      .where(and(eq(companies.claimedByUserId, userId), isNull(companies.deletedAt))).limit(1);

    if (!company) {
      res.json({ company: null, communities: [], stats: { bids: 0, views: 0, credits: 0 } });
      return;
    }

    const comms = await db.select({
      id: communities.id,
      name: communities.name,
      displayName: communities.displayName,
      state: communities.state,
    }).from(companyCommunities)
      .innerJoin(communities, eq(communities.id, companyCommunities.communityId))
      .where(eq(companyCommunities.companyId, company.id));

    res.json({
      company: {
        id: company.id,
        name: company.name,
        imageUrl: company.imageUrl,
        status: company.status,
      },
      communities: comms,
      stats: { bids: 0, views: 0, credits: 0 },
    });
  } catch (error: any) {
    console.error("Failed to get dashboard:", error.message);
    res.status(500).json({ error: "Failed to get dashboard" });
  }
});

export default router;

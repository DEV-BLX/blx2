import { Router, type IRouter, type Request, type Response } from "express";
import express from "express";
import { db } from "@workspace/db";
import { companies, companyCommunities, auditLogs } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "../lib/stripe";

const router: IRouter = Router();

router.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      console.log("[WEBHOOK] Missing signature or webhook secret, processing without verification");
      res.status(400).json({ error: "Missing signature or webhook secret" });
      return;
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("[WEBHOOK] Signature verification failed:", err.message);
      res.status(400).json({ error: "Webhook signature verification failed" });
      return;
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const metadata = session.metadata || {};

        if (metadata.type === "company_claim") {
          await db.update(companies).set({
            claimedByUserId: metadata.user_id,
            claimedAt: new Date(),
            isClaimed: true,
            claimPaid: true,
            status: "active",
            userId: metadata.user_id,
            updatedAt: new Date(),
          }).where(eq(companies.id, metadata.company_id));

          await db.insert(auditLogs).values({
            userId: metadata.user_id,
            action: "company_claimed",
            entityType: "company",
            entityId: metadata.company_id,
            metadata: { stripeSessionId: session.id, paid: true },
          });

          console.log(`[WEBHOOK] Company ${metadata.company_id} claimed by user ${metadata.user_id}`);
        }

        if (metadata.type === "community_add") {
          await db.insert(companyCommunities).values({
            companyId: metadata.company_id,
            communityId: metadata.community_id,
            isPrimary: false,
            paid: true,
            paymentId: session.id,
          });

          await db.insert(auditLogs).values({
            userId: metadata.user_id,
            action: "community_added",
            entityType: "company_community",
            entityId: metadata.company_id,
            metadata: { communityId: metadata.community_id, stripeSessionId: session.id, paid: true },
          });

          console.log(`[WEBHOOK] Community ${metadata.community_id} added to company ${metadata.company_id}`);
        }
      }
    } catch (error: any) {
      console.error("[WEBHOOK] Processing failed:", error.message);
    }

    res.status(200).json({ received: true });
  }
);

export default router;

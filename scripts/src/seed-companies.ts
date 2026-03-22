import { db, pool } from "@workspace/db";
import { categories, companies, companyCommunities, companyCategories, communities } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const COMPANY_CATEGORIES = [
  "Restaurant / Food Service",
  "Home Services / Repair",
  "HVAC / Plumbing / Electrical",
  "Landscaping / Lawn Care",
  "Auto Repair / Detailing",
  "Cleaning Services",
  "Real Estate",
  "Legal Services",
  "Accounting / Tax",
  "Marketing / Advertising",
  "IT / Technology",
  "Health / Wellness",
  "Fitness / Personal Training",
  "Pet Services",
  "Beauty / Salon",
  "Construction / Remodeling",
  "Roofing",
  "Photography / Videography",
  "Event Planning",
  "Education / Tutoring",
];

const SEED_COMPANIES = [
  { name: "Joe's BBQ & Grill", category: "Restaurant / Food Service", city: "Conroe", state: "TX", county: "Montgomery", description: "Authentic Texas BBQ with slow-smoked brisket, ribs, and homestyle sides. Family-owned since 2005." },
  { name: "Lone Star Plumbing", category: "HVAC / Plumbing / Electrical", city: "The Woodlands", state: "TX", county: "Montgomery", description: "Licensed plumbing professionals serving Montgomery County. 24/7 emergency service available." },
  { name: "Texas Green Lawns", category: "Landscaping / Lawn Care", city: "Conroe", state: "TX", county: "Montgomery", description: "Full-service lawn care and landscaping for residential and commercial properties." },
  { name: "Bayou City Auto", category: "Auto Repair / Detailing", city: "Houston", state: "TX", county: "Harris", description: "Complete auto repair and detailing services. ASE-certified mechanics." },
  { name: "Sparkle Clean Houston", category: "Cleaning Services", city: "Houston", state: "TX", county: "Harris", description: "Professional residential and commercial cleaning services in the Houston metro area." },
  { name: "Woodlands Realty Group", category: "Real Estate", city: "The Woodlands", state: "TX", county: "Montgomery", description: "Full-service real estate brokerage specializing in The Woodlands and surrounding communities." },
  { name: "Magnolia Tax & Accounting", category: "Accounting / Tax", city: "Magnolia", state: "TX", county: "Montgomery", description: "Tax preparation, bookkeeping, and accounting services for individuals and small businesses." },
  { name: "Gulf Coast Marketing", category: "Marketing / Advertising", city: "Houston", state: "TX", county: "Harris", description: "Digital marketing agency specializing in local business growth and online presence." },
  { name: "Piney Woods IT Solutions", category: "IT / Technology", city: "Conroe", state: "TX", county: "Montgomery", description: "Managed IT services, network setup, and cybersecurity for small to mid-size businesses." },
  { name: "Conroe Fitness Club", category: "Fitness / Personal Training", city: "Conroe", state: "TX", county: "Montgomery", description: "Full gym, group classes, and personal training in the heart of Conroe." },
];

async function seedCompanies() {
  console.log("Seeding company categories and sample companies...");

  const existingCats = await db.select({ id: categories.id }).from(categories)
    .where(eq(categories.taxonomyType, "company")).limit(1);

  if (existingCats.length === 0) {
    await db.insert(categories).values(
      COMPANY_CATEGORIES.map((name, i) => ({
        name,
        taxonomyType: "company" as const,
        sortOrder: i,
        status: "active" as const,
      }))
    );
    console.log(`Created ${COMPANY_CATEGORIES.length} company categories`);
  } else {
    console.log("Company categories already exist, skipping");
  }

  const existingCompanies = await db.select({ id: companies.id }).from(companies).limit(1);
  if (existingCompanies.length > 0) {
    console.log("Companies already exist, skipping seed companies");
    await pool.end();
    return;
  }

  const allCats = await db.select({ id: categories.id, name: categories.name }).from(categories)
    .where(eq(categories.taxonomyType, "company"));
  const catMap = new Map(allCats.map(c => [c.name, c.id]));

  const allCounties = await db.select({ id: communities.id, name: communities.name, state: communities.state })
    .from(communities).where(eq(communities.isCounty, true));

  const findCounty = (name: string, state: string) => {
    return allCounties.find(c =>
      c.name.toLowerCase().includes(name.toLowerCase()) && c.state === state
    );
  };

  for (const comp of SEED_COMPANIES) {
    const categoryId = catMap.get(comp.category);
    const county = findCounty(comp.county, comp.state);

    const [inserted] = await db.insert(companies).values({
      name: comp.name,
      description: comp.description,
      city: comp.city,
      state: comp.state,
      categoryId: categoryId || null,
      status: "unclaimed",
      isClaimed: false,
    }).returning();

    if (categoryId) {
      await db.insert(companyCategories).values({
        companyId: inserted.id,
        categoryId,
      });
    }

    if (county) {
      await db.insert(companyCommunities).values({
        companyId: inserted.id,
        communityId: county.id,
        isPrimary: true,
        paid: false,
      });
    }

    console.log(`  Created: ${comp.name} (${comp.city}, ${comp.state})`);
  }

  console.log(`Seeded ${SEED_COMPANIES.length} sample companies`);
  await pool.end();
}

seedCompanies().catch((err) => {
  console.error("Seed companies failed:", err);
  process.exit(1);
});

import { db, pool } from "@workspace/db";
import { users, bookingTypes, systemSettings } from "@workspace/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  const existingAdmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "admin@bluelabelexchange.com"))
    .limit(1);

  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash("ChangeMeNow123!", 12);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let referralCode = "BLX-";
    for (let i = 0; i < 5; i++) {
      referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    await db.insert(users).values({
      email: "admin@bluelabelexchange.com",
      passwordHash,
      role: "super_admin",
      status: "active",
      referralCode,
      emailVerified: true,
    });
    console.log("Super admin created");
  } else {
    console.log("Super admin already exists, skipping");
  }

  const existingBookingTypes = await db.select({ id: bookingTypes.id }).from(bookingTypes).limit(1);
  if (existingBookingTypes.length === 0) {
    await db.insert(bookingTypes).values([
      {
        name: "Discovery Session",
        durationMinutes: 15,
        priceCents: 0,
        consultantPayoutPercentage: "92.5",
        isFree: true,
        sortOrder: 0,
      },
      {
        name: "Standard Session",
        durationMinutes: 30,
        priceCents: 3500,
        consultantPayoutPercentage: "92.5",
        isFree: false,
        sortOrder: 1,
      },
      {
        name: "Deep Dive Session",
        durationMinutes: 60,
        priceCents: 6000,
        consultantPayoutPercentage: "92.5",
        isFree: false,
        sortOrder: 2,
      },
    ]);
    console.log("Booking types created");
  } else {
    console.log("Booking types already exist, skipping");
  }

  const existingSettings = await db.select({ id: systemSettings.id }).from(systemSettings).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(systemSettings).values([
      { key: "company.claim_fee_cents", value: "500", type: "integer", category: "fees", description: "One-time company claim fee" },
      { key: "company.community_add_fee_cents", value: "200", type: "integer", category: "fees", description: "One-time fee to add extra community" },
      { key: "echo_pricing.posting_fee_cents", value: "500", type: "integer", category: "echo_pricing", description: "Consumer request posting fee" },
      { key: "echo_pricing.bid_fee_cents", value: "300", type: "integer", category: "echo_pricing", description: "Per-bid fee for companies" },
      { key: "echo_pricing.completion_fee_cents", value: "4500", type: "integer", category: "echo_pricing", description: "Flat completion fee charged to company" },
      { key: "echo_pricing.completion_fee_mode", value: "flat", type: "string", category: "echo_pricing", description: "flat or percentage" },
      { key: "echo_pricing.completion_fee_percentage", value: "0", type: "decimal", category: "echo_pricing", description: "Percentage if mode is percentage" },
      { key: "echo_pricing.max_bids_per_request", value: "25", type: "integer", category: "echo_pricing", description: "Max bids before request closes" },
      { key: "echo_pricing.no_bid_refund_days", value: "3", type: "integer", category: "echo_pricing", description: "Days before no-bid refund" },
      { key: "echo_pricing.receipt_upload_expiry_days", value: "60", type: "integer", category: "echo_pricing", description: "Days to upload receipt after award" },
      { key: "echo_pricing.default_consumer_reward_credits", value: "50", type: "integer", category: "echo_pricing", description: "Default flat credit reward to consumer" },
      { key: "echo_pricing.first_bid_waive_claim_fee", value: "true", type: "boolean", category: "echo_pricing", description: "Waive claim fee on first bid" },
      { key: "echo_pricing.first_bid_waive_bid_fee", value: "true", type: "boolean", category: "echo_pricing", description: "Waive bid fee on first bid" },
      { key: "booking.discovery_price_cents", value: "0", type: "integer", category: "booking", description: "Free discovery session" },
      { key: "booking.standard_price_cents", value: "3500", type: "integer", category: "booking", description: "30-min session price" },
      { key: "booking.deep_dive_price_cents", value: "6000", type: "integer", category: "booking", description: "60-min session price" },
      { key: "booking.consultant_payout_percentage", value: "92.5", type: "decimal", category: "booking", description: "Default consultant payout split" },
      { key: "credits.expiration_years", value: "5", type: "integer", category: "credits", description: "Years until credits expire" },
      { key: "credits.min_redemption_credits", value: "20", type: "integer", category: "credits", description: "Minimum credits for Amazon redemption" },
      { key: "credits.credit_offer_max_no_approval", value: "100", type: "integer", category: "credits", description: "Max reward without admin approval" },
      { key: "credits.credit_offer_absolute_max", value: "250", type: "integer", category: "credits", description: "Absolute max reward per completion" },
      { key: "referral.referrer_reward_credits", value: "5", type: "integer", category: "referral", description: "Credits earned by referrer" },
      { key: "referral.referred_reward_credits", value: "5", type: "integer", category: "referral", description: "Welcome bonus for referred user" },
      { key: "oe.min_platform_fee_percentage", value: "3.5", type: "decimal", category: "owner_exchange", description: "Minimum platform fee for OE sales" },
    ]);
    console.log("System settings created");
  } else {
    console.log("System settings already exist, skipping");
  }

  console.log("Seeding complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

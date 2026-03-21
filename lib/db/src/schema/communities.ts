import { pgTable, uuid, text, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { communityStatusEnum } from "./enums";
import { companies } from "./companies";
import { consultants } from "./consultants";

export const communities = pgTable("communities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  state: text("state"),
  displayName: text("display_name").notNull(),
  fipsCode: text("fips_code"),
  isCounty: boolean("is_county").default(false).notNull(),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  isCustom: boolean("is_custom").default(false).notNull(),
  status: communityStatusEnum("status").notNull().default("active"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companyCommunities = pgTable("company_communities", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  communityId: uuid("community_id").references(() => communities.id).notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  paid: boolean("paid").default(false).notNull(),
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const consultantCommunities = pgTable("consultant_communities", {
  consultantId: uuid("consultant_id").references(() => consultants.id).notNull(),
  communityId: uuid("community_id").references(() => communities.id).notNull(),
});

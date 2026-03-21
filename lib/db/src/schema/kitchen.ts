import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { purchaseTypeEnum, kitchenItemStatusEnum, kitchenPurchaseStatusEnum } from "./enums";

export const kitchenItems = pgTable("kitchen_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  purchaseType: purchaseTypeEnum("purchase_type").notNull(),
  priceCents: integer("price_cents"),
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  trialDays: integer("trial_days"),
  externalUrl: text("external_url"),
  status: kitchenItemStatusEnum("status").notNull().default("active"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const kitchenPurchases = pgTable("kitchen_purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  kitchenItemId: uuid("kitchen_item_id").references(() => kitchenItems.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: kitchenPurchaseStatusEnum("status").notNull().default("active"),
  purchasedAt: timestamp("purchased_at").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

import { pgTable, uuid, text, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { consultants } from "./consultants";
import { companies } from "./companies";
import { bookingTypeStatusEnum, bookingStatusEnum, handoffStatusEnum, payoutStatusEnum } from "./enums";

export const bookingTypes = pgTable("booking_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  priceCents: integer("price_cents").notNull(),
  consultantPayoutPercentage: decimal("consultant_payout_percentage").notNull(),
  isFree: boolean("is_free").default(false).notNull(),
  status: bookingTypeStatusEnum("status").notNull().default("active"),
  sortOrder: integer("sort_order").default(0).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id),
  consumerId: uuid("consumer_id"),
  consultantId: uuid("consultant_id").references(() => consultants.id).notNull(),
  bookingTypeId: uuid("booking_type_id").references(() => bookingTypes.id).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amountCents: integer("amount_cents").notNull(),
  consultantPayoutCents: integer("consultant_payout_cents").notNull(),
  blxRevenueCents: integer("blx_revenue_cents").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending_payment"),
  handoffStatus: handoffStatusEnum("handoff_status"),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

export const consultantPayouts = pgTable("consultant_payouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultantId: uuid("consultant_id").references(() => consultants.id).notNull(),
  bookingId: uuid("booking_id").references(() => bookings.id).notNull(),
  amountCents: integer("amount_cents").notNull(),
  status: payoutStatusEnum("status").notNull().default("unpaid"),
  stripeTransferId: text("stripe_transfer_id"),
  paidAt: timestamp("paid_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

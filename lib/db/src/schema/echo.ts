import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { consumers } from "./consumers";
import { companies } from "./companies";
import { categories } from "./categories";
import { communities } from "./communities";
import { users } from "./users";
import {
  echoRequestStatusEnum,
  completionFeeModeEnum,
  jobStatusEnum,
  companyBidStatusEnum,
  bidStatusEnum,
  echoSenderTypeEnum,
} from "./enums";

export const echoRequests = pgTable("echo_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  consumerId: uuid("consumer_id").references(() => consumers.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  budgetMinCents: integer("budget_min_cents"),
  budgetMaxCents: integer("budget_max_cents"),
  preferredTimeline: text("preferred_timeline"),
  serviceDate: timestamp("service_date"),
  specialNotes: text("special_notes"),
  images: jsonb("images").default([]),
  videoUrl: text("video_url"),
  postingFeeCents: integer("posting_fee_cents").notNull(),
  postingFeePaid: boolean("posting_fee_paid").default(false).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: echoRequestStatusEnum("status").notNull().default("draft"),
  bidCount: integer("bid_count").default(0).notNull(),
  maxBids: integer("max_bids"),
  expiresAt: timestamp("expires_at"),
  noBidRefundEligible: boolean("no_bid_refund_eligible").default(true).notNull(),
  refunded: boolean("refunded").default(false).notNull(),
  closedAt: timestamp("closed_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

export const echoRequestCommunities = pgTable("echo_request_communities", {
  id: uuid("id").defaultRandom().primaryKey(),
  echoRequestId: uuid("echo_request_id").references(() => echoRequests.id).notNull(),
  communityId: uuid("community_id").references(() => communities.id).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

export const echoBids = pgTable("echo_bids", {
  id: uuid("id").defaultRandom().primaryKey(),
  echoRequestId: uuid("echo_request_id").references(() => echoRequests.id).notNull(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  bidAmountCents: integer("bid_amount_cents"),
  bidRangeMinCents: integer("bid_range_min_cents"),
  bidRangeMaxCents: integer("bid_range_max_cents"),
  estimatedTimeline: text("estimated_timeline"),
  message: text("message").notNull(),
  mediaUrls: jsonb("media_urls").default([]),
  bidFeeCents: integer("bid_fee_cents").notNull(),
  bidFeePaid: boolean("bid_fee_paid").default(false).notNull(),
  bidFeeWaived: boolean("bid_fee_waived").default(false).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  isAwarded: boolean("is_awarded").default(false).notNull(),
  awardedAt: timestamp("awarded_at"),
  completionFeeCents: integer("completion_fee_cents"),
  completionFeeMode: completionFeeModeEnum("completion_fee_mode"),
  completionFeePaid: boolean("completion_fee_paid").default(false).notNull(),
  completionFeeStripeId: text("completion_fee_stripe_id"),
  receiptUrl: text("receipt_url"),
  receiptUploadedAt: timestamp("receipt_uploaded_at"),
  receiptApproved: boolean("receipt_approved"),
  receiptReviewedBy: uuid("receipt_reviewed_by").references(() => users.id),
  receiptReviewedAt: timestamp("receipt_reviewed_at"),
  consumerCreditsAwarded: integer("consumer_credits_awarded"),
  jobStatus: jobStatusEnum("job_status"),
  companyStatus: companyBidStatusEnum("company_status").notNull().default("available"),
  bidStatus: bidStatusEnum("bid_status").notNull().default("draft"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

export const echoMessages = pgTable("echo_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  echoBidId: uuid("echo_bid_id").references(() => echoBids.id).notNull(),
  senderType: echoSenderTypeEnum("sender_type").notNull(),
  senderUserId: uuid("sender_user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

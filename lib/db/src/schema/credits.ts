import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { posts } from "./posts";
import {
  creditTransactionTypeEnum,
  creditTransactionStatusEnum,
  completionRuleEnum,
  approvalModeEnum,
  creditOfferStatusEnum,
  proofTypeEnum,
  completionStatusEnum,
} from "./enums";

export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  type: creditTransactionTypeEnum("type").notNull(),
  referenceType: text("reference_type"),
  referenceId: uuid("reference_id"),
  description: text("description"),
  status: creditTransactionStatusEnum("status").notNull().default("completed"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditOffers = pgTable("credit_offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").references(() => posts.id).notNull(),
  rewardAmount: integer("reward_amount").notNull(),
  maxCompletions: integer("max_completions"),
  currentCompletions: integer("current_completions").default(0).notNull(),
  completionRule: completionRuleEnum("completion_rule").notNull(),
  cooldownHours: integer("cooldown_hours"),
  approvalMode: approvalModeEnum("approval_mode").notNull(),
  autoApprovalDelayHours: integer("auto_approval_delay_hours"),
  fundedAmount: integer("funded_amount").notNull(),
  remainingFunded: integer("remaining_funded").notNull(),
  status: creditOfferStatusEnum("status").notNull().default("active"),
  adminApproved: boolean("admin_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creditOfferCompletions = pgTable("credit_offer_completions", {
  id: uuid("id").defaultRandom().primaryKey(),
  creditOfferId: uuid("credit_offer_id").references(() => creditOffers.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  proofType: proofTypeEnum("proof_type").notNull(),
  proofContent: text("proof_content"),
  proofFileUrl: text("proof_file_url"),
  status: completionStatusEnum("status").notNull().default("accepted"),
  disputeReason: text("dispute_reason"),
  disputeEvidenceUrl: text("dispute_evidence_url"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  creditsAwarded: integer("credits_awarded"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

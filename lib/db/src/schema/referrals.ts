import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { referralRewardStatusEnum } from "./enums";

export const referralRewards = pgTable("referral_rewards", {
  id: uuid("id").defaultRandom().primaryKey(),
  referrerUserId: uuid("referrer_user_id").references(() => users.id).notNull(),
  referredUserId: uuid("referred_user_id").references(() => users.id).notNull(),
  referralCodeUsed: text("referral_code_used").notNull(),
  qualifyingAction: text("qualifying_action"),
  referrerCreditsAwarded: integer("referrer_credits_awarded"),
  referredCreditsAwarded: integer("referred_credits_awarded"),
  status: referralRewardStatusEnum("status").notNull().default("pending"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

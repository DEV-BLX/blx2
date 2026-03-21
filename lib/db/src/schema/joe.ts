import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const joeModules = pgTable("joe_modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").unique().notNull(),
  systemPrompt: text("system_prompt").notNull(),
  model: text("model").notNull(),
  version: integer("version").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  allowedAutoActions: jsonb("allowed_auto_actions").default([]),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by").references(() => users.id),
});

export const joeLogs = pgTable("joe_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  moduleId: uuid("module_id").references(() => joeModules.id).notNull(),
  input: text("input"),
  output: text("output"),
  actionTaken: text("action_taken"),
  wasAutoAction: boolean("was_auto_action").default(false).notNull(),
  tokensUsed: integer("tokens_used"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

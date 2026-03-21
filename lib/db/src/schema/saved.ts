import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { posts } from "./posts";
import { companies } from "./companies";
import { savedItemTypeEnum } from "./enums";

export const savedFolders = pgTable("saved_folders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const savedItems = pgTable("saved_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  itemType: savedItemTypeEnum("item_type").notNull(),
  postId: uuid("post_id").references(() => posts.id),
  companyId: uuid("company_id").references(() => companies.id),
  externalUrl: text("external_url"),
  externalLabel: text("external_label"),
  notes: text("notes"),
  folderId: uuid("folder_id").references(() => savedFolders.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

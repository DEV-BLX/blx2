import { pgTable, uuid, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { categories } from "./categories";
import { tagStatusEnum } from "./enums";

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdByCompanyId: uuid("created_by_company_id").references(() => companies.id),
  isPromoted: boolean("is_promoted").default(false).notNull(),
  status: tagStatusEnum("status").notNull().default("active"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

export const companyTags = pgTable("company_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  tagId: uuid("tag_id").references(() => tags.id).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

export const tagCategoryAssociations = pgTable("tag_category_associations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tagId: uuid("tag_id").references(() => tags.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  strength: integer("strength").default(1).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

export const consultantCategories = pgTable("consultant_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultantId: uuid("consultant_id"),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

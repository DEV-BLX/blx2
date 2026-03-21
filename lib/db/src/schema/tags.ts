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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companyTags = pgTable("company_tags", {
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  tagId: uuid("tag_id").references(() => tags.id).notNull(),
});

export const tagCategoryAssociations = pgTable("tag_category_associations", {
  tagId: uuid("tag_id").references(() => tags.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  strength: integer("strength").default(1).notNull(),
});

export const consultantCategories = pgTable("consultant_categories", {
  consultantId: uuid("consultant_id"),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
});

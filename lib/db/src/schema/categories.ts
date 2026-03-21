import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { taxonomyTypeEnum, categoryStatusEnum } from "./enums";

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  parentId: uuid("parent_id"),
  taxonomyType: taxonomyTypeEnum("taxonomy_type").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  status: categoryStatusEnum("status").notNull().default("active"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

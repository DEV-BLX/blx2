import { pgTable, uuid, text, integer, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { consultants } from "./consultants";
import { users } from "./users";
import { categories } from "./categories";
import { tags } from "./tags";
import {
  authorTypeEnum,
  postTypeEnum,
  audienceEnum,
  paymentModelEnum,
  postStatusEnum,
} from "./enums";

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorType: authorTypeEnum("author_type").notNull(),
  authorCompanyId: uuid("author_company_id").references(() => companies.id),
  authorConsultantId: uuid("author_consultant_id").references(() => consultants.id),
  authorAdminId: uuid("author_admin_id").references(() => users.id),
  displayAuthorName: text("display_author_name"),
  postType: postTypeEnum("post_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  categoryId: uuid("category_id").references(() => categories.id),
  subcategoryId: uuid("subcategory_id").references(() => categories.id),
  audience: audienceEnum("audience").notNull().default("company"),
  paymentModel: paymentModelEnum("payment_model"),
  priceCents: integer("price_cents"),
  creditPrice: integer("credit_price"),
  platformFeePercentage: decimal("platform_fee_percentage"),
  platformFeeFlatCents: integer("platform_fee_flat_cents"),
  mediaUrls: jsonb("media_urls").default([]),
  externalLink: text("external_link"),
  downloadUrl: text("download_url"),
  downloadLimit: integer("download_limit"),
  downloadExpiryHours: integer("download_expiry_hours"),
  status: postStatusEnum("status").notNull().default("draft"),
  scheduledPublishAt: timestamp("scheduled_publish_at"),
  scheduledExpireAt: timestamp("scheduled_expire_at"),
  publishedAt: timestamp("published_at"),
  communityScope: jsonb("community_scope"),
  voteCount: integer("vote_count").default(0).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

export const postTags = pgTable("post_tags", {
  postId: uuid("post_id").references(() => posts.id).notNull(),
  tagId: uuid("tag_id").references(() => tags.id).notNull(),
});

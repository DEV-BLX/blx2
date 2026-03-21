import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { consultantStatusEnum } from "./enums";

export const consultants = pgTable("consultants", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
  website: text("website"),
  bookingUrl: text("booking_url"),
  acceptingBookings: boolean("accepting_bookings").default(true).notNull(),
  status: consultantStatusEnum("status").notNull().default("active"),
  stripeConnectAccountId: text("stripe_connect_account_id"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

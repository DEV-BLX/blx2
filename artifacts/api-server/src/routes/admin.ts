import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { users, companies, consumers, consultants, bookings, systemSettings } from "@workspace/db/schema";
import { eq, isNull, count } from "drizzle-orm";
import { withAuth, withRole, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

const adminRoles = ["admin", "super_admin", "content_admin", "support_admin", "finance_admin"];

router.get(
  "/admin/stats",
  withAuth(),
  withRole(adminRoles),
  async (req: AuthRequest, res) => {
    try {
      const [userCount] = await db.select({ count: count() }).from(users).where(isNull(users.deletedAt));
      const [companyCount] = await db.select({ count: count() }).from(companies).where(isNull(companies.deletedAt));
      const [consumerCount] = await db.select({ count: count() }).from(consumers).where(isNull(consumers.deletedAt));
      const [consultantCount] = await db.select({ count: count() }).from(consultants).where(isNull(consultants.deletedAt));
      const [bookingCount] = await db.select({ count: count() }).from(bookings).where(isNull(bookings.deletedAt));

      res.json({
        users: userCount.count,
        companies: companyCount.count,
        consumers: consumerCount.count,
        consultants: consultantCount.count,
        bookings: bookingCount.count,
      });
    } catch (error) {
      req.log?.error({ err: error }, "Failed to get admin stats");
      res.status(500).json({ error: "Failed to get stats" });
    }
  }
);

router.get(
  "/admin/settings",
  withAuth(),
  withRole(adminRoles),
  async (req: AuthRequest, res) => {
    try {
      const settings = await db.select().from(systemSettings);
      res.json({ settings });
    } catch (error) {
      req.log?.error({ err: error }, "Failed to get settings");
      res.status(500).json({ error: "Failed to get settings" });
    }
  }
);

router.put(
  "/admin/settings/:key",
  withAuth(),
  withRole(["super_admin"]),
  async (req: AuthRequest, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;

      if (value === undefined || value === null) {
        res.status(400).json({ error: "Value is required" });
        return;
      }

      const [existing] = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
      if (!existing) {
        res.status(404).json({ error: "Setting not found" });
        return;
      }

      const [updated] = await db
        .update(systemSettings)
        .set({
          value: String(value),
          updatedBy: req.user!.id,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.key, key))
        .returning();

      res.json({ setting: updated });
    } catch (error) {
      req.log?.error({ err: error }, "Failed to update setting");
      res.status(500).json({ error: "Failed to update setting" });
    }
  }
);

export default router;

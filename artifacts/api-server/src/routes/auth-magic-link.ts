import { Router, type IRouter } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { users, magicLinkTokens } from "@workspace/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { createSession, generateReferralCode, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();
const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000;

router.post("/auth/magic-link/request", async (req: AuthRequest, res) => {
  try {
    const { email, purpose = "login" } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const validPurposes = ["login", "verify_email", "password_reset"];
    if (!validPurposes.includes(purpose)) {
      res.status(400).json({ error: "Invalid purpose" });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MS);

    await db.insert(magicLinkTokens).values({
      email: normalizedEmail,
      token,
      purpose,
      expiresAt,
    });

    console.log(`[MAGIC_LINK] Token for ${normalizedEmail} (purpose: ${purpose}): ${token}`);
    console.log(`[MAGIC_LINK] In production, send via email. Link: /auth/magic-link/verify?token=${token}`);

    res.json({ message: "Magic link sent (check server logs in development)" });
  } catch (error: any) {
    console.error("Magic link request failed:", error.message);
    res.status(500).json({ error: "Failed to create magic link" });
  }
});

router.post("/auth/magic-link/verify", async (req: AuthRequest, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    const [link] = await db
      .select()
      .from(magicLinkTokens)
      .where(eq(magicLinkTokens.token, token))
      .limit(1);

    if (!link) {
      res.status(400).json({ error: "Invalid or expired token" });
      return;
    }

    if (link.used) {
      res.status(400).json({ error: "Token has already been used" });
      return;
    }

    if (new Date() > link.expiresAt) {
      res.status(400).json({ error: "Token has expired" });
      return;
    }

    await db
      .update(magicLinkTokens)
      .set({ used: true })
      .where(eq(magicLinkTokens.id, link.id));

    if (link.purpose === "verify_email") {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, link.email))
        .limit(1);

      if (user) {
        await db.update(users).set({ emailVerified: true }).where(eq(users.id, user.id));
      }

      res.json({ verified: true, purpose: "verify_email" });
      return;
    }

    if (link.purpose === "password_reset") {
      res.json({ verified: true, purpose: "password_reset", email: link.email, resetToken: token });
      return;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, link.email))
      .limit(1);

    if (!user) {
      res.json({ needsRegistration: true, email: link.email });
      return;
    }

    if (user.status !== "active") {
      res.status(403).json({ error: "Account is not active" });
      return;
    }

    if (!user.emailVerified) {
      await db.update(users).set({ emailVerified: true }).where(eq(users.id, user.id));
    }

    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    await createSession(user.id, res);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        referralCode: user.referralCode,
      },
    });
  } catch (error: any) {
    console.error("Magic link verification failed:", error.message);
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;

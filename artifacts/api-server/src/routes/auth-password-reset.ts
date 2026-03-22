import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { users, magicLinkTokens } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, deleteAllUserSessions, createSession, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/password-reset", async (req: AuthRequest, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const [link] = await db
      .select()
      .from(magicLinkTokens)
      .where(eq(magicLinkTokens.token, token))
      .limit(1);

    if (!link || link.purpose !== "password_reset") {
      res.status(400).json({ error: "Invalid reset token" });
      return;
    }

    if (link.used) {
      res.status(400).json({ error: "This reset link has already been used" });
      return;
    }

    if (new Date() > link.expiresAt) {
      res.status(400).json({ error: "Reset link has expired" });
      return;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, link.email))
      .limit(1);

    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    const passwordHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ passwordHash, emailVerified: true })
      .where(eq(users.id, user.id));

    await db
      .update(magicLinkTokens)
      .set({ used: true })
      .where(eq(magicLinkTokens.id, link.id));

    await deleteAllUserSessions(user.id);
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
    console.error("Password reset failed:", error.message);
    res.status(500).json({ error: "Password reset failed" });
  }
});

export default router;

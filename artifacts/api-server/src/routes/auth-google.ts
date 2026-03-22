import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { users, accounts } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { createSession, generateReferralCode, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

async function verifyGoogleToken(credential: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID not configured");

  const { OAuth2Client } = await import("google-auth-library");
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.sub) {
    throw new Error("Invalid Google token payload");
  }
  return {
    email: payload.email.toLowerCase(),
    name: payload.name || "",
    sub: payload.sub,
    emailVerified: payload.email_verified ?? false,
  };
}

router.post("/auth/google", async (req: AuthRequest, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      res.status(400).json({ error: "Google credential is required" });
      return;
    }

    const googleUser = await verifyGoogleToken(credential);

    const existingAccount = await db
      .select({ userId: accounts.userId })
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, "google"),
          eq(accounts.providerAccountId, googleUser.sub)
        )
      )
      .limit(1);

    if (existingAccount.length > 0) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, existingAccount[0].userId))
        .limit(1);

      if (!user || user.status !== "active") {
        res.status(403).json({ error: "Account is not active" });
        return;
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
      return;
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email))
      .limit(1);

    if (existingUser) {
      await db.insert(accounts).values({
        userId: existingUser.id,
        provider: "google",
        providerAccountId: googleUser.sub,
      });

      if (googleUser.emailVerified && !existingUser.emailVerified) {
        await db.update(users).set({ emailVerified: true }).where(eq(users.id, existingUser.id));
      }

      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, existingUser.id));
      await createSession(existingUser.id, res);

      res.json({
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
          status: existingUser.status,
          referralCode: existingUser.referralCode,
        },
      });
      return;
    }

    res.json({
      needsRole: true,
      email: googleUser.email,
    });
  } catch (error: any) {
    console.error("Google auth failed:", error.message);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

router.post("/auth/google/complete", async (req: AuthRequest, res) => {
  try {
    const { credential, role, referralCode: refCode } = req.body;
    if (!credential || !role) {
      res.status(400).json({ error: "Credential and role are required" });
      return;
    }

    const validRoles = ["company", "consumer", "consultant"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    const googleUser = await verifyGoogleToken(credential);

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, googleUser.email))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    let referralCode: string;
    let codeExists = true;
    do {
      referralCode = generateReferralCode();
      const check = await db.select({ id: users.id }).from(users).where(eq(users.referralCode, referralCode)).limit(1);
      codeExists = check.length > 0;
    } while (codeExists);

    let referredByUserId: string | null = null;
    if (refCode) {
      const referrer = await db.select({ id: users.id }).from(users).where(eq(users.referralCode, refCode)).limit(1);
      if (referrer.length > 0) {
        referredByUserId = referrer[0].id;
      }
    }

    const [newUser] = await db.insert(users).values({
      email: googleUser.email,
      passwordHash: null,
      role,
      status: "active",
      referralCode,
      referredByUserId,
      emailVerified: googleUser.emailVerified,
    }).returning();

    await db.insert(accounts).values({
      userId: newUser.id,
      provider: "google",
      providerAccountId: googleUser.sub,
    });

    await createSession(newUser.id, res);

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        referralCode: newUser.referralCode,
      },
    });
  } catch (error: any) {
    console.error("Google registration failed:", error.message);
    res.status(500).json({ error: "Google registration failed" });
  }
});

export default router;

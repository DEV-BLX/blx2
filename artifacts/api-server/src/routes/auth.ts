import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  getUserFromSession,
  generateReferralCode,
  type AuthRequest,
} from "../lib/auth";

const router: IRouter = Router();

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return false;
  }
  return true;
}

router.post("/auth/register", async (req: AuthRequest, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!checkRateLimit(ip)) {
      res.status(429).json({ error: "Too many requests. Try again later." });
      return;
    }

    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      res.status(400).json({ error: "Email, password, and role are required" });
      return;
    }

    const validRoles = ["company", "consumer", "consultant"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: "Invalid role. Must be one of: company, consumer, consultant" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1);
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

    const passwordHash = await hashPassword(password);

    const referredByCode = req.body.referralCode;
    let referredByUserId: string | null = null;
    if (referredByCode) {
      const referrer = await db.select({ id: users.id }).from(users).where(eq(users.referralCode, referredByCode)).limit(1);
      if (referrer.length > 0) {
        referredByUserId = referrer[0].id;
      }
    }

    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase(),
      passwordHash,
      role,
      status: "active",
      referralCode,
      referredByUserId,
      emailVerified: false,
    }).returning();

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
  } catch (error) {
    req.log?.error({ err: error }, "Registration failed");
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req: AuthRequest, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!checkRateLimit(ip)) {
      res.status(429).json({ error: "Too many requests. Try again later." });
      return;
    }

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (user.status !== "active") {
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
  } catch (error) {
    req.log?.error({ err: error }, "Login failed");
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/auth/logout", async (req: AuthRequest, res) => {
  try {
    const token = req.cookies?.blx_session;
    if (token) {
      await deleteSession(token, res);
    }
    res.json({ success: true });
  } catch (error) {
    req.log?.error({ err: error }, "Logout failed");
    res.status(500).json({ error: "Logout failed" });
  }
});

router.get("/auth/me", async (req: AuthRequest, res) => {
  try {
    const token = req.cookies?.blx_session;
    if (!token) {
      res.json({ user: null });
      return;
    }

    const user = await getUserFromSession(token);
    if (!user) {
      res.json({ user: null });
      return;
    }

    res.json({ user });
  } catch (error) {
    req.log?.error({ err: error }, "Failed to get current user");
    res.status(500).json({ error: "Failed to get current user" });
  }
});

export default router;

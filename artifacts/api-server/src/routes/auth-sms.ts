import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { users, smsVerificationCodes } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { withAuth, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();
const SMS_CODE_EXPIRY_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.startsWith("+")) return phone;
  return `+${digits}`;
}

router.post("/auth/sms/send", withAuth(), async (req: AuthRequest, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ error: "Phone number is required" });
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    const userId = req.user!.id;

    const recentCodes = await db
      .select()
      .from(smsVerificationCodes)
      .where(
        and(
          eq(smsVerificationCodes.userId, userId),
          gt(smsVerificationCodes.createdAt, new Date(Date.now() - 60 * 1000))
        )
      );

    if (recentCodes.length > 0) {
      res.status(429).json({ error: "Please wait before requesting a new code" });
      return;
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + SMS_CODE_EXPIRY_MS);

    await db.insert(smsVerificationCodes).values({
      userId,
      phone: normalizedPhone,
      code,
      purpose: "phone_verification",
      expiresAt,
    });

    console.log(`[SMS] Verification code for ${normalizedPhone}: ${code}`);
    console.log(`[SMS] In production, send via SMS provider (Twilio, etc.)`);

    res.json({ message: "Verification code sent (check server logs in development)" });
  } catch (error: any) {
    console.error("SMS send failed:", error.message);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

router.post("/auth/sms/verify", withAuth(), async (req: AuthRequest, res) => {
  try {
    const { code, phone } = req.body;
    if (!code || !phone) {
      res.status(400).json({ error: "Code and phone number are required" });
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    const userId = req.user!.id;

    const [record] = await db
      .select()
      .from(smsVerificationCodes)
      .where(
        and(
          eq(smsVerificationCodes.userId, userId),
          eq(smsVerificationCodes.phone, normalizedPhone),
          eq(smsVerificationCodes.used, false)
        )
      )
      .orderBy(smsVerificationCodes.createdAt)
      .limit(1);

    if (!record) {
      res.status(400).json({ error: "No pending verification found" });
      return;
    }

    if (new Date() > record.expiresAt) {
      res.status(400).json({ error: "Verification code has expired" });
      return;
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      res.status(429).json({ error: "Too many attempts. Request a new code." });
      return;
    }

    if (record.code !== code) {
      await db
        .update(smsVerificationCodes)
        .set({ attempts: record.attempts + 1 })
        .where(eq(smsVerificationCodes.id, record.id));

      res.status(400).json({ error: "Invalid verification code" });
      return;
    }

    await db
      .update(smsVerificationCodes)
      .set({ used: true })
      .where(eq(smsVerificationCodes.id, record.id));

    await db
      .update(users)
      .set({ phone: normalizedPhone, phoneVerified: true })
      .where(eq(users.id, userId));

    res.json({ verified: true });
  } catch (error: any) {
    console.error("SMS verification failed:", error.message);
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;

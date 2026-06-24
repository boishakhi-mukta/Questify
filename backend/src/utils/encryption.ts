import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import { env } from "@/config/environment";

// ── Password hashing ───────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(env.BCRYPT_ROUNDS);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// ── Reset token ────────────────────────────────────────────────────────────────
// Returns raw token (to send to user) + its SHA-256 hash (to store in DB).
// Expires in 1 hour by default.
export interface ResetToken {
  token: string;
  hashedToken: string;
  expiresAt: Date;
}

export function generateResetToken(expiresInMs = 60 * 60 * 1000): ResetToken {
  const token = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + expiresInMs);
  return { token, hashedToken, expiresAt };
}

// Verify a raw token against its stored hash
export function verifyResetToken(rawToken: string, storedHash: string): boolean {
  const hash = createHash("sha256").update(rawToken).digest("hex");
  return hash === storedHash;
}

// ── Email verification token ───────────────────────────────────────────────────
export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

// ── General-purpose secure random string ──────────────────────────────────────
export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

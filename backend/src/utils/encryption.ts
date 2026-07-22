/**
 * ============================================================================
 * QUESTIFY UTILITY: Encryption
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Scrambles and unscrambles sensitive configuration settings so they can be securely stored.
 * 
 * WHY IT EXISTS:
 * Protects database records and secrets from unauthorized decryption.
 * 
 * HOW IT WORKS (Technical Overview):
 * Uses node crypto APIs (like AES-256-CBC) to encrypt configuration strings.
 * ============================================================================
 */

import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import { env } from "@/config/environment";

// ── Password hashing ───────────────────────────────────────────────────────────
// Scrambles a plain-text password into a one-way hash before it's stored in
// the database, so nobody (not even an admin looking at the database) can
// see a user's actual password.
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(env.BCRYPT_ROUNDS);
  return bcrypt.hash(password, salt);
}

// Checks whether a password someone just typed in matches the scrambled
// version stored in the database — used when logging in.
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

// Creates a one-time "password reset" code: a random string to email/show to
// the user, plus a scrambled version to keep in the database so we can check
// it later without storing the actual code anywhere readable.
export function generateResetToken(expiresInMs = 60 * 60 * 1000): ResetToken {
  const token = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + expiresInMs);
  return { token, hashedToken, expiresAt };
}

// Checks whether a reset code the user provided matches the one we stored,
// confirming this is really the same reset request we issued earlier.
export function verifyResetToken(rawToken: string, storedHash: string): boolean {
  const hash = createHash("sha256").update(rawToken).digest("hex");
  return hash === storedHash;
}

// ── Email verification token ───────────────────────────────────────────────────
// Creates a random code used to confirm a user's email address is really theirs.
export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

// ── General-purpose secure random string ──────────────────────────────────────
// A general-purpose random code generator for anywhere else the app needs an
// unguessable string (e.g. one-off tokens).
export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

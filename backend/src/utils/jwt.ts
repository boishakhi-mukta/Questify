/**
 * ============================================================================
 * QUESTIFY UTILITY: JWT (JSON Web Tokens Handler)
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Creates and verifies digital keys (session cookies) that keep users logged in.
 * 
 * WHY IT EXISTS:
 * Bypasses the need for typing passwords on every click by utilizing secure temp keys.
 * 
 * HOW IT WORKS (Technical Overview):
 * Uses jsonwebtoken algorithms to sign user identity details, verifying expiration parameters.
 * ============================================================================
 */

import jwt from "jsonwebtoken";
import { env } from "@/config/environment";
import { AuthenticationError, TokenExpiredError } from "./errors";
import type { UserRole, JwtPayload } from "@/types";

export interface JwtUserPayload {
  id: string;
  role: UserRole;
  name: string;
}

// ── Generate tokens ────────────────────────────────────────────────────────────
// Creates a short-lived "access pass" (default 24h) that proves who a user is
// on every request after they log in — like a wristband at an event.
export function generateAccessToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  } as jwt.SignOptions);
}

// Creates a longer-lived token (default 7 days) used only to fetch a fresh
// access token later, so the user doesn't have to type their password again
// every time the short-lived one expires.
export function generateRefreshToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  } as jwt.SignOptions);
}

// Convenience helper that hands back both tokens at once — used right after
// a successful login.
export function generateTokenPair(payload: JwtUserPayload): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

// ── Verify tokens ──────────────────────────────────────────────────────────────
// Checks that an access token is genuine and not expired before letting a
// request through. Throws a clear error if it's expired or has been tampered with.
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw new TokenExpiredError();
    throw new AuthenticationError("Invalid access token. Please log in.");
  }
}

// Same check as above, but for refresh tokens — used when a user's access
// token has expired and the app is asking for a new one.
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw new TokenExpiredError("Refresh token expired. Please log in again.");
    throw new AuthenticationError("Invalid refresh token. Please log in.");
  }
}

// ── Decode without verifying (read-only, untrusted) ───────────────────────────
// Peeks at what's inside a token without checking whether it's genuine —
// useful for reading non-sensitive info quickly, but never trust this alone
// for security decisions.
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded === "string") return null;
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}

// ── Check expiry without throwing ─────────────────────────────────────────────
// A quick yes/no check for whether a token has expired, without raising an error.
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
}

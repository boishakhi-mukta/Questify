/**
 * ============================================================================
 * QUESTIFY MIDDLEWARE: Rate Limiter
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Blocks users from sending too many requests in a short time.
 * 
 * WHY IT EXISTS:
 * Prevents system overload and brute-force login attempts.
 * 
 * HOW IT WORKS (Technical Overview):
 * Tracks request counts per IP using sliding window limiters.
 * ============================================================================
 */

import rateLimit, { Options, RateLimitRequestHandler } from "express-rate-limit";
import type { Request } from "express";
import type { AuthenticatedRequest } from "@/types";

// Builds the "you're doing that too much, slow down" message sent back when
// someone hits a rate limit below.
const errorBody = (message: string) => () => ({
  success: false,
  error: { code: "TOO_MANY_REQUESTS", message },
  timestamp: new Date().toISOString(),
});

const base: Partial<Options> = {
  standardHeaders: true,   // RateLimit-* headers (RFC 6585)
  legacyHeaders: false,    // Disable X-RateLimit-* headers
  skipSuccessfulRequests: false,
};

// ── General: 100 req / 15 min per IP ──────────────────────────────────────────
export const generalLimiter: RateLimitRequestHandler = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: errorBody("Too many requests. Please try again later."),
});

// ── Auth: 5 req / min per IP (login, register, refresh) ───────────────────────
export const authLimiter: RateLimitRequestHandler = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Only count failures toward the limit
  message: errorBody(
    "Too many authentication attempts. Please wait a minute and try again."
  ),
});

// ── User-specific: 1000 req / hour keyed by user ID (falls back to IP) ────────
export const userLimiter: RateLimitRequestHandler = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  max: 1000,
  keyGenerator: (req: Request): string => {
    const authReq = req as AuthenticatedRequest;
    return authReq.user?.id ?? req.ip ?? "anonymous";
  },
  message: errorBody("Hourly request limit reached. Please try again later."),
});

// ── Strict: 3 req / 15 min per IP (password reset, verification emails) ───────
export const strictLimiter: RateLimitRequestHandler = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: errorBody(
    "Too many attempts. Please wait 15 minutes and try again."
  ),
});

// ── Login hard-cap: 10 failed attempts / 15 min per IP ────────────────────────
// Applied on top of authLimiter to enforce a sliding fail-safe.
// Only failed requests count (skipSuccessfulRequests: true).
export const loginHardLimiter: RateLimitRequestHandler = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: errorBody(
    "Too many failed login attempts. Please wait 15 minutes and try again."
  ),
});

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
export function generateAccessToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  } as jwt.SignOptions);
}

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
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw new TokenExpiredError();
    throw new AuthenticationError("Invalid access token. Please log in.");
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw new TokenExpiredError("Refresh token expired. Please log in again.");
    throw new AuthenticationError("Invalid refresh token. Please log in.");
  }
}

// ── Decode without verifying (read-only, untrusted) ───────────────────────────
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
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
}

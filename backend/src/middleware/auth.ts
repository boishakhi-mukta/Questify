/**
 * ============================================================================
 * QUESTIFY MIDDLEWARE: Auth (Security check)
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Checks if requests contain a valid user identity token (JWT) before proceeding.
 * 
 * WHY IT EXISTS:
 * Block unauthorized access to private data.
 * 
 * HOW IT WORKS (Technical Overview):
 * Extracts token headers and decodes parameters.
 * ============================================================================
 */

import { Response, NextFunction } from "express";
import { verifyAccessToken } from "@/utils/jwt";
import type { AuthenticatedRequest } from "@/types";

/**
 * verifyJWT (alias: protect) — extracts and verifies the Bearer token.
 * Attaches { id, role, name } to req.user on success.
 * Delegates to errorHandler via next() on failure.
 */
export function verifyJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Not authenticated. Please log in." },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    const token = header.split(" ")[1];
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, role: decoded.role, name: decoded.name };
    next();
  } catch (err) {
    // verifyAccessToken throws AuthenticationError or TokenExpiredError — both
    // are APIErrors so errorHandler will format them correctly.
    next(err);
  }
}

/** Alias kept for backward compatibility with existing route files */
export const protect = verifyJWT;

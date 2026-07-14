/**
 * ============================================================================
 * QUESTIFY MIDDLEWARE: Request ID
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Tags every request with a unique tracking number.
 * 
 * WHY IT EXISTS:
 * Simplifies tracing logs when debugging issues.
 * 
 * HOW IT WORKS (Technical Overview):
 * Appends a unique UUID to request contexts and responses.
 * ============================================================================
 */

import { Request, Response, NextFunction } from "express";
import { randomBytes } from "crypto";

/**
 * Attaches a unique request ID to `res.locals.requestId`.
 *
 * Priority:
 *  1. X-Request-ID header sent by the client (frontend http-client sends this)
 *  2. Freshly generated `req_<8 hex chars>`
 *
 * The resolved ID is echoed back in the response X-Request-ID header so the
 * client can correlate request logs with error responses.
 *
 * Mount this as the FIRST middleware in app.ts so every subsequent handler
 * (including the error handler) can read res.locals.requestId.
 */
export function attachRequestId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const clientId = req.headers["x-request-id"];
  const requestId =
    typeof clientId === "string" && clientId.trim().length > 0
      ? clientId.trim()
      : `req_${randomBytes(4).toString("hex")}`;

  res.locals.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
}

/**
 * ============================================================================
 * QUESTIFY MIDDLEWARE: Global Error Handler
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Safety net catching unexpected issues and returning clean warnings.
 * 
 * WHY IT EXISTS:
 * Prevents the application from crashing and hides technical details.
 * 
 * HOW IT WORKS (Technical Overview):
 * Formats errors and logs them to files before responding with clean HTTP codes.
 * ============================================================================
 */

import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";
import { JsonWebTokenError, TokenExpiredError as JwtTokenExpiredError } from "jsonwebtoken";
import { env } from "@/config/environment";
import { HTTP, ERROR_CODES } from "@/config/constants";
import { logger } from "@/utils/logger";
import {
  APIError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  TokenExpiredError,
} from "@/utils/errors";
import type { AuthenticatedRequest } from "@/types";

// ── Mongoose server error shape ────────────────────────────────────────────────
interface MongoServerError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

// ── Fields stripped from logged request bodies ─────────────────────────────────
const SENSITIVE_FIELDS = new Set([
  "password",
  "currentPassword",
  "newPassword",
  "oldPassword",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "passwordHash",
]);

// Replaces sensitive fields (passwords, tokens, etc.) with "[REDACTED]" before
// a failed request's body is written to the logs, so secrets never end up in
// log files.
function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    result[key] = SENSITIVE_FIELDS.has(key) ? "[REDACTED]" : value;
  }
  return result;
}

// ── Logging ────────────────────────────────────────────────────────────────────

interface LogContext {
  requestId: string;
  method:    string;
  url:       string;
  ip:        string;
  userId?:   string;
  body:      unknown;
  error: {
    name:       string;
    message:    string;
    statusCode: number;
    stack?:     string;
  };
  timestamp: string;
}

// Gathers all the useful details about a failed request (who made it, what
// URL, what error, etc.) into one bundle that both the log message and the
// error response can be built from.
function buildContext(
  req: Request,
  res: Response,
  err: Error,
  statusCode: number
): LogContext {
  const authReq = req as AuthenticatedRequest;
  return {
    requestId: (res.locals.requestId as string | undefined) ?? "unknown",
    method:    req.method,
    url:       req.originalUrl,
    ip:        req.ip ?? "unknown",
    userId:    authReq.user?.id,
    body:      sanitizeBody(req.body),
    error: {
      name:       err.name,
      message:    err.message,
      statusCode,
      stack:      err.stack,
    },
    timestamp: new Date().toISOString(),
  };
}

// Writes the error to the server logs — serious errors (500s) are logged as
// "error" level with the full technical stack trace; everything else (like a
// user typo) is logged as a lighter "warning."
function logError(ctx: LogContext): void {
  if (env.NODE_ENV === "test") return;

  const meta = {
    requestId:  ctx.requestId,
    method:     ctx.method,
    url:        ctx.url,
    ip:         ctx.ip,
    userId:     ctx.userId,
    statusCode: ctx.error.statusCode,
    errorName:  ctx.error.name,
  };

  if (ctx.error.statusCode >= 500) {
    logger.error(ctx.error.message, { ...meta, stack: ctx.error.stack });
  } else {
    logger.warn(ctx.error.message, meta);
  }
}

// ── Shared response builder ────────────────────────────────────────────────────

interface ErrorBody {
  code:       string;
  message:    string;
  statusCode: number;
  timestamp:  string;
  requestId:  string;
  details?:   string[];
  stack?:     string;
}

// Builds the actual JSON message sent back to whoever made the failed
// request — a clear error message and code, plus (only in development) the
// technical stack trace to help developers debug.
function buildErrorBody(
  ctx:     LogContext,
  code:    string,
  message: string,
  details?: string[]
): { success: false; error: ErrorBody } {
  const error: ErrorBody = {
    code,
    message,
    statusCode: ctx.error.statusCode,
    timestamp:  ctx.timestamp,
    requestId:  ctx.requestId,
    ...(details && details.length > 0 ? { details } : {}),
    ...(env.NODE_ENV === "development" && ctx.error.stack
      ? { stack: ctx.error.stack }
      : {}),
  };
  return { success: false, error };
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ERROR HANDLER
// The single place every error in the app eventually flows through. It looks
// at what kind of error occurred (a known app error, an expired login token,
// bad data, a duplicate record, or something totally unexpected) and turns
// it into a consistent, readable response instead of letting the app crash.
// ══════════════════════════════════════════════════════════════════════════════

export function errorHandler(
  err:  Error,
  req:  Request,
  res:  Response,
  _next: NextFunction
): void {

  // ── 1. Typed API errors (our own error classes) ───────────────────────────
  if (err instanceof APIError) {
    const details = "details" in err
      ? (err as ValidationError).details
      : undefined;
    const ctx = buildContext(req, res, err, err.statusCode);
    logError(ctx);
    res
      .status(err.statusCode)
      .json(buildErrorBody(ctx, err.code, err.message, details));
    return;
  }

  // ── 2. Raw JWT errors (escaped from auth middleware) ──────────────────────
  if (err instanceof JwtTokenExpiredError) {
    const typed = new TokenExpiredError();
    const ctx   = buildContext(req, res, typed, HTTP.UNAUTHORIZED);
    logError(ctx);
    res
      .status(HTTP.UNAUTHORIZED)
      .json(buildErrorBody(ctx, ERROR_CODES.TOKEN_EXPIRED, typed.message));
    return;
  }

  if (err instanceof JsonWebTokenError) {
    const typed = new AuthenticationError("Invalid token. Please log in again.");
    const ctx   = buildContext(req, res, typed, HTTP.UNAUTHORIZED);
    logError(ctx);
    res
      .status(HTTP.UNAUTHORIZED)
      .json(buildErrorBody(ctx, ERROR_CODES.UNAUTHORIZED, typed.message));
    return;
  }

  // ── 3. Mongoose schema validation error ───────────────────────────────────
  if (err instanceof MongooseError.ValidationError) {
    const details = Object.values(err.errors).map((e) => e.message);
    const typed   = new ValidationError("Validation failed", details);
    const ctx     = buildContext(req, res, typed, HTTP.UNPROCESSABLE);
    logError(ctx);
    res
      .status(HTTP.UNPROCESSABLE)
      .json(buildErrorBody(ctx, typed.code, typed.message, details));
    return;
  }

  // ── 4. Mongoose cast error (bad ObjectId format) ──────────────────────────
  if (err instanceof MongooseError.CastError) {
    const message = `Invalid value for field '${err.path}'.`;
    const ctx     = buildContext(req, res, err, HTTP.BAD_REQUEST);
    ctx.error.statusCode = HTTP.BAD_REQUEST;
    logError(ctx);
    res
      .status(HTTP.BAD_REQUEST)
      .json(buildErrorBody(ctx, ERROR_CODES.VALIDATION_ERROR, message));
    return;
  }

  // ── 5. MongoDB duplicate key (E11000) ─────────────────────────────────────
  const mongoErr = err as MongoServerError;
  if (mongoErr.code === 11000 && mongoErr.keyValue) {
    const field   = Object.keys(mongoErr.keyValue)[0];
    const message = `A record with this ${field} already exists.`;
    const ctx     = buildContext(req, res, err, HTTP.CONFLICT);
    logError(ctx);
    res
      .status(HTTP.CONFLICT)
      .json(buildErrorBody(ctx, ERROR_CODES.ALREADY_EXISTS, message));
    return;
  }

  // ── 6. Unhandled / programming errors → 500 ──────────────────────────────
  const ctx = buildContext(req, res, err, HTTP.INTERNAL_ERROR);
  logError(ctx);
  res
    .status(HTTP.INTERNAL_ERROR)
    .json(
      buildErrorBody(ctx, ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.")
    );
}

// ── 404 catch-all ─────────────────────────────────────────────────────────────
// Runs when a request doesn't match any known route (e.g. a typo'd URL) —
// turns it into a proper "not found" error instead of Express's default response.
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`${req.method} ${req.originalUrl}`));
}

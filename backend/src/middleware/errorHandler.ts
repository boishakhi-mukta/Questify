import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";
import { JsonWebTokenError, TokenExpiredError as JwtTokenExpiredError } from "jsonwebtoken";
import { env } from "@/config/environment";
import { HTTP, ERROR_CODES } from "@/config/constants";
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

function logError(ctx: LogContext): void {
  if (env.NODE_ENV === "test") return;

  if (env.NODE_ENV === "production") {
    // Structured JSON — picked up by log aggregators (Datadog, CloudWatch, etc.)
    const { error: { stack: _stack, ...errorWithoutStack }, ...rest } = ctx;
    console.error(JSON.stringify({ level: "error", ...rest, error: errorWithoutStack }));
    return;
  }

  // Development: human-readable
  const severityTag = ctx.error.statusCode >= 500 ? "❌" : "⚠️";
  const userTag     = ctx.userId ? ` [user:${ctx.userId}]` : "";
  console.error(
    `${severityTag} ${ctx.error.statusCode} ${ctx.method} ${ctx.url}${userTag}` +
    ` [${ctx.requestId}] — ${ctx.error.message}`
  );
  if (ctx.error.statusCode >= 500 && ctx.error.stack) {
    console.error(ctx.error.stack);
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
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`${req.method} ${req.originalUrl}`));
}

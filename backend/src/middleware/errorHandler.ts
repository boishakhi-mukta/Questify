import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";
import { env } from "@/config/environment";
import { HTTP } from "@/config/constants";
import { APIError, NotFoundError, ValidationError } from "@/utils/errors";
import type { AuthenticatedRequest } from "@/types";

interface MongoServerError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

interface ErrorContext {
  method: string;
  url: string;
  ip: string;
  userId?: string;
  errorName: string;
  statusCode: number;
}

function buildContext(req: Request, err: Error, statusCode: number): ErrorContext {
  const authReq = req as AuthenticatedRequest;
  return {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip ?? "unknown",
    userId: authReq.user?.id,
    errorName: err.name,
    statusCode,
  };
}

function logError(context: ErrorContext, err: Error): void {
  if (env.NODE_ENV === "test") return;

  const tag = context.statusCode >= 500 ? "❌ " : "⚠️ ";
  const user = context.userId ? ` [user:${context.userId}]` : "";
  console.error(
    `${tag} ${context.statusCode} ${context.method} ${context.url}${user} — ${err.message}`
  );

  if (env.NODE_ENV === "development" && context.statusCode >= 500) {
    console.error(err.stack);
  }
}

function timestamp(): string {
  return new Date().toISOString();
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── Typed API error ────────────────────────────────────────────────────────
  if (err instanceof APIError) {
    logError(buildContext(req, err, err.statusCode), err);

    const body: Record<string, unknown> = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...("details" in err && (err as ValidationError).details.length > 0
          ? { details: (err as ValidationError).details }
          : {}),
      },
      timestamp: timestamp(),
    };
    if (env.NODE_ENV === "development") body.stack = err.stack;
    res.status(err.statusCode).json(body);
    return;
  }

  // ── Mongoose validation error ──────────────────────────────────────────────
  if (err instanceof MongooseError.ValidationError) {
    const details = Object.values(err.errors).map((e) => e.message);
    const typed = new ValidationError("Validation failed", details);
    logError(buildContext(req, typed, HTTP.UNPROCESSABLE), typed);
    res.status(HTTP.UNPROCESSABLE).json({
      success: false,
      error: { code: typed.code, message: typed.message, details },
      timestamp: timestamp(),
    });
    return;
  }

  // ── Mongoose cast error (bad ObjectId) ────────────────────────────────────
  if (err instanceof MongooseError.CastError) {
    logError(buildContext(req, err, HTTP.BAD_REQUEST), err);
    res.status(HTTP.BAD_REQUEST).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: `Invalid value for field '${err.path}'.`,
      },
      timestamp: timestamp(),
    });
    return;
  }

  // ── MongoDB duplicate key ──────────────────────────────────────────────────
  const mongoErr = err as MongoServerError;
  if (mongoErr.code === 11000 && mongoErr.keyValue) {
    const field = Object.keys(mongoErr.keyValue)[0];
    logError(buildContext(req, err, HTTP.CONFLICT), err);
    res.status(HTTP.CONFLICT).json({
      success: false,
      error: {
        code: "ALREADY_EXISTS",
        message: `A record with this ${field} already exists.`,
      },
      timestamp: timestamp(),
    });
    return;
  }

  // ── Fallback: 500 ─────────────────────────────────────────────────────────
  logError(buildContext(req, err, HTTP.INTERNAL_ERROR), err);
  const body: Record<string, unknown> = {
    success: false,
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
    timestamp: timestamp(),
  };
  if (env.NODE_ENV === "development") body.stack = err.stack;
  res.status(HTTP.INTERNAL_ERROR).json(body);
}

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`${req.method} ${req.originalUrl}`));
}

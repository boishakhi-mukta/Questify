import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";
import { env } from "@/config/environment";
import { HTTP } from "@/config/constants";
import { APIError, NotFoundError, ValidationError } from "@/utils/errors";

interface MongoServerError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // Four-argument signature required by Express for error middleware
  _next: NextFunction
): void {
  if (env.NODE_ENV === "development") {
    console.error("❌  Error:", err);
  }

  // ── Already a typed API error ──────────────────────────────────────────────
  if (err instanceof APIError) {
    const body: Record<string, unknown> = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...("details" in err ? { details: (err as ValidationError).details } : {}),
      },
      timestamp: new Date().toISOString(),
    };
    if (env.NODE_ENV === "development") body.stack = err.stack;
    res.status(err.statusCode).json(body);
    return;
  }

  // ── Mongoose validation error ──────────────────────────────────────────────
  if (err instanceof MongooseError.ValidationError) {
    const details = Object.values(err.errors).map((e) => e.message);
    const typed = new ValidationError("Validation failed", details);
    res.status(HTTP.UNPROCESSABLE).json({
      success: false,
      error: { code: typed.code, message: typed.message, details },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // ── Mongoose cast error (bad ObjectId) ────────────────────────────────────
  if (err instanceof MongooseError.CastError) {
    res.status(HTTP.BAD_REQUEST).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: `Invalid value for field '${err.path}'.` },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // ── MongoDB duplicate key ──────────────────────────────────────────────────
  const mongoErr = err as MongoServerError;
  if (mongoErr.code === 11000 && mongoErr.keyValue) {
    const field = Object.keys(mongoErr.keyValue)[0];
    res.status(HTTP.CONFLICT).json({
      success: false,
      error: { code: "ALREADY_EXISTS", message: `A record with this ${field} already exists.` },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // ── Fallback: 500 ─────────────────────────────────────────────────────────
  const body: Record<string, unknown> = {
    success: false,
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
    timestamp: new Date().toISOString(),
  };
  if (env.NODE_ENV === "development") body.stack = err.stack;
  res.status(HTTP.INTERNAL_ERROR).json(body);
}

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`${req.method} ${req.originalUrl}`));
}

import { AppError } from "./AppError";
import { ERROR_CODES, HTTP } from "@/config/constants";
import type { ErrorCode } from "@/config/constants";

// ── Base typed error ───────────────────────────────────────────────────────────
export class APIError extends AppError {
  public readonly code: ErrorCode;

  constructor(message: string, statusCode: number, code: ErrorCode) {
    super(message, statusCode);
    this.code = code;
    this.name = "APIError";
  }
}

// ── 422 Validation ─────────────────────────────────────────────────────────────
export class ValidationError extends APIError {
  public readonly details: string[];

  constructor(message = "Validation failed", details: string[] = []) {
    super(message, HTTP.UNPROCESSABLE, ERROR_CODES.VALIDATION_ERROR);
    this.name = "ValidationError";
    this.details = details;
  }
}

// ── 400 Bad request ────────────────────────────────────────────────────────────
export class BadRequestError extends APIError {
  constructor(message: string) {
    super(message, HTTP.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    this.name = "BadRequestError";
  }
}

// ── 401 Unauthenticated ────────────────────────────────────────────────────────
export class AuthenticationError extends APIError {
  constructor(
    message = "Not authenticated. Please log in.",
    code: ErrorCode = ERROR_CODES.UNAUTHORIZED
  ) {
    super(message, HTTP.UNAUTHORIZED, code);
    this.name = "AuthenticationError";
  }
}

// ── 401 Token expired (subtype of AuthenticationError) ────────────────────────
export class TokenExpiredError extends AuthenticationError {
  constructor(message = "Session expired. Please log in again.") {
    super(message, ERROR_CODES.TOKEN_EXPIRED);
    this.name = "TokenExpiredError";
  }
}

// ── 403 Unauthorized ───────────────────────────────────────────────────────────
export class AuthorizationError extends APIError {
  constructor(
    message = "You do not have permission to perform this action.",
    code: ErrorCode = ERROR_CODES.FORBIDDEN
  ) {
    super(message, HTTP.FORBIDDEN, code);
    this.name = "AuthorizationError";
  }
}

// ── 404 Not found ──────────────────────────────────────────────────────────────
export class NotFoundError extends APIError {
  constructor(resource = "Resource") {
    super(`${resource} not found.`, HTTP.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    this.name = "NotFoundError";
  }
}

// ── 409 Conflict ───────────────────────────────────────────────────────────────
export class ConflictError extends APIError {
  constructor(
    message: string,
    code: ErrorCode = ERROR_CODES.ALREADY_EXISTS
  ) {
    super(message, HTTP.CONFLICT, code);
    this.name = "ConflictError";
  }
}

// ── Re-export base for single import point ─────────────────────────────────────
export { AppError };

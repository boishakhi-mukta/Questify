/**
 * ============================================================================
 * QUESTIFY UTILITY: Structured System Errors
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A collection of custom error messages (like "Email not found" or "Access Denied").
 * 
 * WHY IT EXISTS:
 * Helps the server respond with clear explanations when something goes wrong.
 * 
 * HOW IT WORKS (Technical Overview):
 * Declares classes extending standard JS errors to supply specific HTTP status codes.
 * ============================================================================
 */

import { AppError } from "./AppError";
import { ERROR_CODES, HTTP } from "@/config/constants";
import type { ErrorCode } from "@/config/constants";

// ── Base typed error ───────────────────────────────────────────────────────────
// The blueprint every specific error below is built from — adds a short
// machine-readable "code" (like "NOT_FOUND") on top of the plain AppError.
export class APIError extends AppError {
  public readonly code: ErrorCode;

  constructor(message: string, statusCode: number, code: ErrorCode) {
    super(message, statusCode);
    this.code = code;
    this.name = "APIError";
  }
}

// ── 422 Validation ─────────────────────────────────────────────────────────────
// Thrown when the data someone submitted (a form, an API request) doesn't
// pass the required checks — e.g. a missing field or a badly formatted email.
export class ValidationError extends APIError {
  public readonly details: string[];

  constructor(message = "Validation failed", details: string[] = []) {
    super(message, HTTP.UNPROCESSABLE, ERROR_CODES.VALIDATION_ERROR);
    this.name = "ValidationError";
    this.details = details;
  }
}

// ── 400 Bad request ────────────────────────────────────────────────────────────
// Thrown when the request itself doesn't make sense (e.g. malformed input),
// as opposed to a specific field failing validation rules.
export class BadRequestError extends APIError {
  constructor(message: string) {
    super(message, HTTP.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    this.name = "BadRequestError";
  }
}

// ── 401 Unauthenticated ────────────────────────────────────────────────────────
// Thrown when someone tries to access something without being logged in at all.
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
// Thrown specifically when someone was logged in, but their session has timed
// out and they need to log in again.
export class TokenExpiredError extends AuthenticationError {
  constructor(message = "Session expired. Please log in again.") {
    super(message, ERROR_CODES.TOKEN_EXPIRED);
    this.name = "TokenExpiredError";
  }
}

// ── 403 Unauthorized ───────────────────────────────────────────────────────────
// Thrown when someone is logged in, but their account role (student, teacher,
// admin) doesn't have permission to do what they're trying to do.
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
// Thrown when whatever was requested (a course, a user, a file) doesn't exist.
export class NotFoundError extends APIError {
  constructor(resource = "Resource") {
    super(`${resource} not found.`, HTTP.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    this.name = "NotFoundError";
  }
}

// ── 409 Conflict ───────────────────────────────────────────────────────────────
// Thrown when an action would create a duplicate or clash with existing data
// (e.g. registering an email that's already taken, enrolling twice).
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

/**
 * ============================================================================
 * QUESTIFY UTILITY: Enhanced Responses
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A collection of response formatters supporting pagination and CSV data layouts.
 * 
 * WHY IT EXISTS:
 * Used for exporting user records and paging course listings.
 * 
 * HOW IT WORKS (Technical Overview):
 * Extends basic response formatting, appending pagination meta headers.
 * ============================================================================
 */

import { Response } from "express";
import { HTTP } from "@/config/constants";
import type { PaginationMeta } from "@/types";
import type { APIError } from "./errors";
import type { ErrorCode } from "@/config/constants";

// ── Response shapes ────────────────────────────────────────────────────────────
export interface SuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorEnvelope {
  success: false;
  error: {
    code: ErrorCode | string;
    message: string;
    details?: string[];
  };
  timestamp: string;
  stack?: string;
}

export interface PaginatedEnvelope<T> extends Omit<SuccessEnvelope<T[]>, "data"> {
  data: T[];
  pagination: PaginationMeta;
}

// ── Timestamp helper ───────────────────────────────────────────────────────────
// Stamps every response with the exact time it was sent, for logging/debugging.
const now = (): string => new Date().toISOString();

// ── Success responses ──────────────────────────────────────────────────────────
// Sends a standard "it worked" reply to the frontend with whatever data was
// requested attached (e.g. a course list, a user profile).
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode: number = HTTP.OK
): void {
  const body: SuccessEnvelope<T> = { success: true, message, data, timestamp: now() };
  res.status(statusCode).json(body);
}

// Sends a "this new thing was created" reply (HTTP 201) — used right after
// something new is added, like a course, assignment, or user account.
export function sendCreated<T>(res: Response, data: T, message = "Created"): void {
  sendSuccess(res, data, message, HTTP.CREATED);
}

// Sends an empty "done, nothing more to say" reply (HTTP 204) — used after
// actions like deleting something, where there's no data to send back.
export function sendNoContent(res: Response): void {
  res.status(HTTP.NO_CONTENT).end();
}

// Sends a list of results along with page-number info (current page, total
// pages, total count), so the frontend can show pagination controls.
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message = "Success"
): void {
  const body: PaginatedEnvelope<T> = {
    success: true,
    message,
    data,
    pagination,
    timestamp: now(),
  };
  res.status(HTTP.OK).json(body);
}

// ── Error response ─────────────────────────────────────────────────────────────
// Sends a consistent "something went wrong" reply — the right HTTP status
// code, a human-readable message, and (optionally, for developers only) the
// technical stack trace of where the error happened.
export function sendError(
  res: Response,
  err: APIError,
  includeStack = false
): void {
  const body: ErrorEnvelope = {
    success: false,
    error: {
      code: err.code,
      message: err.message,
      ...("details" in err && Array.isArray((err as { details: string[] }).details)
        ? { details: (err as { details: string[] }).details }
        : {}),
    },
    timestamp: now(),
    ...(includeStack && err.stack ? { stack: err.stack } : {}),
  };
  res.status(err.statusCode).json(body);
}

// ── Build pagination meta from query params ────────────────────────────────────
// Works out the page-navigation numbers (how many pages exist in total, etc.)
// from the current page, how many items per page, and the total item count.
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}

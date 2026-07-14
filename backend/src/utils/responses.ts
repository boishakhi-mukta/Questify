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
const now = (): string => new Date().toISOString();

// ── Success responses ──────────────────────────────────────────────────────────
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode: number = HTTP.OK
): void {
  const body: SuccessEnvelope<T> = { success: true, message, data, timestamp: now() };
  res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message = "Created"): void {
  sendSuccess(res, data, message, HTTP.CREATED);
}

export function sendNoContent(res: Response): void {
  res.status(HTTP.NO_CONTENT).end();
}

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

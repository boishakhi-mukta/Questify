/**
 * ============================================================================
 * QUESTIFY UTILITY: Response Layout Helper
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Standardizes API responses with consistent properties like success flags and messages.
 * 
 * WHY IT EXISTS:
 * Helps the frontend easily understand and parse replies from the backend.
 * 
 * HOW IT WORKS (Technical Overview):
 * Exports response builder functions that serialize server data cleanly.
 * ============================================================================
 *
 * NOTE: This is an earlier, simpler version of these helpers — the app
 * actually uses the richer utils/responses.ts (plural) throughout the
 * controllers. This file is kept around but is not currently imported anywhere.
 */

import { Response } from "express";
import type { ApiResponse, PaginationMeta } from "@/types";

// Sends a standard "it worked" reply to the frontend with whatever data was
// requested attached.
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): void {
  const body: ApiResponse<T> = { success: true, message, data };
  res.status(statusCode).json(body);
}

// Sends a "this new thing was created" reply (HTTP 201) — used right after
// an admin adds a new record, like a course or user.
export function sendCreated<T>(res: Response, data: T, message = "Created"): void {
  sendSuccess(res, data, message, 201);
}

// Sends a list of results along with page-number info, so the frontend can
// show "page 2 of 5" style navigation.
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message = "Success"
): void {
  const body: ApiResponse<T[]> = { success: true, message, data, pagination };
  res.status(200).json(body);
}

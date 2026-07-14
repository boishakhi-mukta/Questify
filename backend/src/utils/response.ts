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
 */

import { Response } from "express";
import type { ApiResponse, PaginationMeta } from "@/types";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): void {
  const body: ApiResponse<T> = { success: true, message, data };
  res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message = "Created"): void {
  sendSuccess(res, data, message, 201);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message = "Success"
): void {
  const body: ApiResponse<T[]> = { success: true, message, data, pagination };
  res.status(200).json(body);
}

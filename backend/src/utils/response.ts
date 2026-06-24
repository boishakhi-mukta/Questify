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

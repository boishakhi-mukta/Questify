/**
 * Backward-compatible re-export.
 * All new code should import directly from @/utils/http-client.
 */
export { apiClient as default, apiClient, get, post, patch, put, del, getPaginated } from "@/utils/http-client";

/**
 * ============================================================================
 * QUESTIFY LIBRARY: API Settings
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Maps server paths used by browsers to access backend directories.
 * 
 * WHY IT EXISTS:
 * Avoids hardcoding server URLs across components.
 * 
 * HOW IT WORKS (Technical Overview):
 * Exports config strings reading from environment variables.
 * ============================================================================
 */

/**
 * Backward-compatible re-export.
 * All new code should import directly from @/utils/http-client.
 */
export { apiClient as default, apiClient, get, post, patch, put, del, getPaginated } from "@/utils/http-client";

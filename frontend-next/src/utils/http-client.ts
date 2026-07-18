/**
 * ============================================================================
 * QUESTIFY UTILITY: HTTP Fetch Client
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A custom HTTP helper sending clean browser requests.
 * 
 * WHY IT EXISTS:
 * Unifies fetch behaviors, automatically logging connection warnings.
 * 
 * HOW IT WORKS (Technical Overview):
 * Custom fetch wraps parsing JSON payloads.
 * ============================================================================
 */

/**
 * Questify API HTTP client.
 *
 * Features:
 *  - JWT attached from localStorage on every request
 *  - Unique X-Request-ID header for server-side log correlation
 *  - Dev-only request/response console logging
 *  - Automatic token refresh on 401 (retries original request once)
 *  - Auth clear + redirect to /login when refresh fails
 *  - Typed ApiError thrown for all non-2xx responses
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { ApiError, type ApiErrorBody } from "@/types/api-response";

// ── Storage keys (must match AuthContext) ─────────────────────────────────────
const STORAGE = {
  TOKEN:         "questify_token",
  REFRESH_TOKEN: "questify_refresh_token",
  USER:          "questify_user",
} as const;

const COOKIE = {
  TOKEN: "questify_token",
  ROLE:  "questify_role",
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

const isDev = process.env.NODE_ENV === "development";

// Reads the user's saved login token from the browser's local storage
// (returns nothing if we're not in a browser, e.g. during server rendering).
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE.TOKEN);
}

// Same idea as getToken, but for the longer-lived "refresh token" used to
// silently get a new login token once the short-lived one expires.
function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE.REFRESH_TOKEN);
}

// Saves a fresh login token to local storage and to a cookie (the cookie is
// what lets the server-side middleware check "is this person logged in?").
function saveToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE.TOKEN, token);
  document.cookie = `${COOKIE.TOKEN}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

// Wipes all signs that someone was logged in — used when logging out, or
// when the session can no longer be renewed and the user must sign in again.
function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE.TOKEN);
  localStorage.removeItem(STORAGE.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE.USER);
  document.cookie = `${COOKIE.TOKEN}=; path=/; max-age=0`;
  document.cookie = `${COOKIE.ROLE}=; path=/; max-age=0`;
}

/** Generates a unique ID for each request to aid server-side log correlation. */
function generateRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Parses an axios error into a typed ApiError. */
function parseAxiosError(err: unknown): ApiError {
  if (!axios.isAxiosError(err)) {
    return new ApiError("An unexpected error occurred", 0);
  }

  const status  = err.response?.status ?? 0;
  const body    = err.response?.data as ApiErrorBody | undefined;

  if (body?.error) {
    return new ApiError(
      body.error.message,
      status,
      body.error.code,
      body.error.details ?? []
    );
  }

  // Network error / timeout / no response
  if (!err.response) {
    const msg = err.code === "ECONNABORTED"
      ? "Request timed out. Please try again."
      : "Network error. Check your connection.";
    return new ApiError(msg, 0, "NETWORK_ERROR");
  }

  return new ApiError(err.message || "An error occurred", status, "UNKNOWN_ERROR");
}

// ── Token refresh ─────────────────────────────────────────────────────────────
// A flag to prevent multiple concurrent refresh attempts
let isRefreshing   = false;
let refreshQueue:  Array<(token: string | null) => void> = [];

// Once a token refresh finishes (successfully or not), this tells every
// other request that was waiting on it what the new token is (or null if it failed).
function onRefreshDone(newToken: string | null) {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
}

// Tries to trade the long-lived refresh token for a brand-new login token,
// so the user doesn't get logged out just because their session expired.
async function attemptTokenRefresh(baseURL: string): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await axios.post<{ data: { accessToken: string } }>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );
    const newToken = res.data.data.accessToken;
    saveToken(newToken);
    return newToken;
  } catch {
    return null;
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

// Builds the shared "phone line" the whole app uses to talk to the backend
// server: it automatically attaches the login token to every request, logs
// requests/responses during development, and retries once with a fresh
// token if a request fails because the old one expired.
export function createHttpClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 30_000,
    headers: { "Content-Type": "application/json" },
  });

  // ── Request interceptor ─────────────────────────────────────────────────────
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Attach auth token
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for server-side log correlation
      const requestId = generateRequestId();
      config.headers["X-Request-ID"] = requestId;

      // Dev logging
      if (isDev) {
        console.log(
          `[API →] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
          {
            requestId,
            params: config.params,
            data:   config.data,
          }
        );
      }

      return config;
    },
    (err) => Promise.reject(err)
  );

  // ── Response interceptor ────────────────────────────────────────────────────
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      if (isDev) {
        const reqId = response.config.headers["X-Request-ID"] as string | undefined;
        console.log(
          `[API ←] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
          { requestId: reqId, data: response.data }
        );
      }
      return response;
    },

    async (err: unknown) => {
      if (!axios.isAxiosError(err)) {
        return Promise.reject(parseAxiosError(err));
      }

      const status         = err.response?.status;
      const originalConfig = err.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

      // ── 401: attempt a single token refresh then retry ─────────────────────
      if (status === 401 && originalConfig && !originalConfig._retry) {
        if (isRefreshing) {
          // Wait for the in-flight refresh to complete, then retry
          return new Promise((resolve, reject) => {
            refreshQueue.push((newToken) => {
              if (!newToken || !originalConfig) {
                reject(parseAxiosError(err));
                return;
              }
              originalConfig.headers = {
                ...originalConfig.headers,
                Authorization: `Bearer ${newToken}`,
              };
              resolve(client(originalConfig));
            });
          });
        }

        originalConfig._retry = true;
        isRefreshing          = true;

        const newToken = await attemptTokenRefresh(baseURL);
        isRefreshing   = false;

        if (newToken) {
          onRefreshDone(newToken);
          originalConfig.headers = {
            ...originalConfig.headers,
            Authorization: `Bearer ${newToken}`,
          };
          return client(originalConfig);
        }

        // Refresh failed — clear auth and redirect to login
        onRefreshDone(null);
        clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      // ── Log errors in dev ───────────────────────────────────────────────────
      if (isDev) {
        const reqId = err.config?.headers["X-Request-ID"] as string | undefined;
        console.error(
          `[API ✗] ${status} ${err.config?.method?.toUpperCase()} ${err.config?.url}`,
          { requestId: reqId, error: err.response?.data }
        );
      }

      return Promise.reject(parseAxiosError(err));
    }
  );

  return client;
}

// ── Singleton client used throughout the app ──────────────────────────────────
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const apiClient = createHttpClient(BASE_URL);

// ── Typed request helpers ─────────────────────────────────────────────────────
// These wrap axios methods and unwrap the backend envelope so callers receive
// `data` directly instead of `response.data.data`.

import type { ApiResponse, PaginatedResponse } from "@/types/api-response";

// Asks the server for data (a "GET" request) and hands back just the useful
// part of the reply, skipping the extra wrapper the server adds around it.
export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.get<ApiResponse<T>>(url, { params, ...config });
  return res.data.data;
}

// Sends new information to the server to create something (a "POST" request),
// like enrolling in a course or submitting an assignment.
export async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.post<ApiResponse<T>>(url, body, config);
  return res.data.data;
}

// Sends a partial update to the server (a "PATCH" request), changing only
// the specific fields provided instead of replacing everything.
export async function patch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.patch<ApiResponse<T>>(url, body, config);
  return res.data.data;
}

// Sends a full replacement update to the server (a "PUT" request).
export async function put<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.put<ApiResponse<T>>(url, body, config);
  return res.data.data;
}

// Asks the server to delete something (a "DELETE" request), such as
// unenrolling from a course or removing a user account.
export async function del<T = void>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.delete<ApiResponse<T>>(url, config);
  return res.data.data;
}

// Like `get`, but for endpoints that return a long list of items one "page"
// at a time — also hands back the pagination info (current page, total pages, etc).
export async function getPaginated<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<PaginatedResponse<T>> {
  const res = await apiClient.get<PaginatedResponse<T>>(url, { params, ...config });
  return res.data;
}

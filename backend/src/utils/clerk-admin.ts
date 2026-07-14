/**
 * ============================================================================
 * QUESTIFY UTILITY: Clerk Admin Linker
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Syncs user accounts created in Questify with our external authentication provider (Clerk).
 * 
 * WHY IT EXISTS:
 * Ensures logins, roles, and profiles are synced between databases and authentication providers.
 * 
 * HOW IT WORKS (Technical Overview):
 * Uses the Clerk Backend SDK API to create, modify, and terminate accounts.
 * ============================================================================
 */

import { env } from "@/config/environment";

const CLERK_BASE = "https://api.clerk.com/v1";

// ── Minimal Clerk types needed for admin operations ───────────────────────────
export interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string; id: string }>;
  first_name:  string | null;
  last_name:   string | null;
  public_metadata: Record<string, unknown>;
}

interface ClerkCreatePayload {
  email_address: string;
  password:      string;
  first_name:    string;
  last_name:     string;
  public_metadata?: { role?: string };
}

interface ClerkUpdatePayload {
  first_name?:     string;
  last_name?:      string;
  public_metadata?: { role?: string };
}

// ── Internal request helper ────────────────────────────────────────────────────
async function clerkFetch<T>(
  method: string,
  path:   string,
  body?:  object
): Promise<T> {
  const res = await fetch(`${CLERK_BASE}${path}`, {
    method,
    headers: {
      Authorization:  `Bearer ${env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(`Clerk ${method} ${path} → ${res.status}: ${text}`);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

// ── Returns false if CLERK_SECRET_KEY is not configured ───────────────────────
export function isClerkConfigured(): boolean {
  return Boolean(env.CLERK_SECRET_KEY);
}

// ── Public API ─────────────────────────────────────────────────────────────────
export async function clerkCreateUser(payload: ClerkCreatePayload): Promise<ClerkUser> {
  return clerkFetch<ClerkUser>("POST", "/users", {
    ...payload,
    skip_password_checks: true,       // temp passwords may not meet Clerk policy
    skip_password_requirement: false,
  });
}

export async function clerkUpdateUser(
  clerkId: string,
  payload: ClerkUpdatePayload
): Promise<ClerkUser> {
  return clerkFetch<ClerkUser>("PATCH", `/users/${clerkId}`, payload);
}

export async function clerkDeleteUser(clerkId: string): Promise<void> {
  return clerkFetch<void>("DELETE", `/users/${clerkId}`);
}

export async function clerkFindByEmail(email: string): Promise<ClerkUser | null> {
  try {
    const results = await clerkFetch<ClerkUser[]>(
      "GET",
      `/users?email_address=${encodeURIComponent(email)}`
    );
    return results[0] ?? null;
  } catch {
    return null;
  }
}

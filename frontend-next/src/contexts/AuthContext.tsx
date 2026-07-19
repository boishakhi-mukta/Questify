"use client";

/**
 * ============================================================================
 * QUESTIFY GLOBAL CONTEXT: Auth Session Context
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Keeps user session keys and role details loaded in browser memory.
 * 
 * WHY IT EXISTS:
 * Bypasses redundant logins and ensures user info is shared across pages.
 * 
 * HOW IT WORKS (Technical Overview):
 * Wraps pages in standard React Context Providers, caching JWT payloads.
 * ============================================================================
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/types/auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Saves one small piece of info (like the login token) into a browser cookie,
// so the server can also see it — not just the browser tab itself.
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

// Removes a cookie that was previously set (used when logging out).
function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

// ── Context shape ──────────────────────────────────────────────────────────────
export interface AuthContextValue {
  user:            AuthUser | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  setAuth:         (user: AuthUser, token: string) => void;
  clearAuth:       () => void;
  updateUser:      (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────
// Wraps the whole app so every page/component can know who's logged in
// without each one having to fetch that info separately. Think of it as the
// app's shared "who am I logged in as?" memory.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // When the app first loads, check if the browser already remembers a
  // logged-in session from before (e.g. the user refreshed the page) and
  // restore it, instead of forcing them to log in again.
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("questify_token");
      const storedUser  = localStorage.getItem("questify_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Corrupted storage — start fresh
      localStorage.removeItem("questify_token");
      localStorage.removeItem("questify_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remembers a successful login: saves the user's info and token so the
  // whole app knows they're signed in, and it survives a page refresh.
  const setAuth = useCallback((newUser: AuthUser, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("questify_token", newToken);
    localStorage.setItem("questify_user", JSON.stringify(newUser));
    // Cookies allow server components and middleware to read auth state
    setCookie("questify_token", newToken);
    setCookie("questify_role",  newUser.role);
  }, []);

  // Forgets the logged-in session completely — used when the user logs out.
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("questify_token");
    localStorage.removeItem("questify_user");
    deleteCookie("questify_token");
    deleteCookie("questify_role");
  }, []);

  // Updates a few fields on the currently logged-in user's profile (e.g.
  // after they change their name or avatar) without needing to log in again.
  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem("questify_user", JSON.stringify(updated));
      if (patch.role) setCookie("questify_role", patch.role);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token && !!user, isLoading, setAuth, clearAuth, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
// The way any component reads the shared login info set up above. Errors
// loudly if used outside the AuthProvider, since that would be a coding mistake.
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}

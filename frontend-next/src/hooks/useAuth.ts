"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useAuth
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Hook querying login contexts to return user login states.
 * 
 * WHY IT EXISTS:
 * Lets components check log-in states.
 * 
 * HOW IT WORKS (Technical Overview):
 * Directly wraps AuthContext getters.
 * ============================================================================
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import type { LoginResponse, LoginResult, LoginError, UserRole } from "@/types/auth";

const ROLE_REDIRECT: Record<UserRole, string> = {
  admin:   "/admin",
  teacher: "/teacher",
  student: "/student",
};

// Only allow same-site, absolute paths — blocks open-redirect via a crafted
// `?redirect=` param (e.g. protocol-relative "//evil.com" or "https://evil.com").
function isSafeRedirect(path: string | undefined): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}

// ── Error message normaliser ───────────────────────────────────────────────────
// Turns a raw, technical server error into a short, friendly sentence a
// student can actually understand (e.g. "Invalid password" instead of a
// cryptic server code).
function normaliseLoginError(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const ax  = err as { response?: { data?: { error?: { message?: string } } } };
    const msg = ax.response?.data?.error?.message ?? "";
    if (msg.includes("Email not found"))  return "Email not found. Check your email address.";
    if (msg.includes("Invalid password")) return "Invalid password. Please try again.";
    if (msg.includes("disabled"))         return "Your account has been disabled. Contact your administrator.";
    if (msg)                              return msg;
  }
  return "Login failed. Please contact your administrator.";
}

// ── Hook ───────────────────────────────────────────────────────────────────────
// The single place components go to check "is someone logged in?", log a
// user in, log them out, or read/update their profile info.
export function useAuth() {
  const router                               = useRouter();
  const { user, token, isAuthenticated, isLoading, setAuth, clearAuth, updateUser } = useAuthContext();
  const [loginError,  setLoginError]         = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn]        = useState(false);

  // Sends the entered email/password to the server. On success, saves the
  // logged-in user and sends them either to the page they came from (if any)
  // or their role's home page. If their password needs to be changed first,
  // it flags that instead of redirecting immediately.
  const login = useCallback(
    async (email: string, password: string, redirectTo?: string): Promise<LoginResult | LoginError> => {
      setIsLoggingIn(true);
      setLoginError(null);

      try {
        const { data } = await api.post<{ data: LoginResponse }>("/auth/login", { email, password });
        const { accessToken, user: loginUser } = data.data;

        // Store the full user with requiresPasswordChange from the top-level response
        // (backend sends it both on user object and as a top-level convenience field)
        const enriched = {
          ...loginUser,
          requiresPasswordChange: data.data.requiresPasswordChange ?? loginUser.requiresPasswordChange ?? false,
        };

        setAuth(enriched, accessToken);

        if (enriched.requiresPasswordChange) {
          return { success: true, requiresPasswordChange: true };
        }

        router.push(isSafeRedirect(redirectTo) ? redirectTo : ROLE_REDIRECT[loginUser.role] ?? "/dashboard");
        return { success: true, requiresPasswordChange: false };
      } catch (err) {
        const message = normaliseLoginError(err);
        setLoginError(message);
        return { success: false, error: message };
      } finally {
        setIsLoggingIn(false);
      }
    },
    [setAuth, router]
  );

  // Clears the saved login session and sends the user back to the login page.
  const logout = useCallback(() => {
    clearAuth();
    router.push("/login");
  }, [clearAuth, router]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    loginError,
    isLoggingIn,
    clearLoginError: () => setLoginError(null),
  };
}

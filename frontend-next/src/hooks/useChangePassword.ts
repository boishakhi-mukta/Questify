"use client";

import { useState, useCallback } from "react";
import api from "@/lib/api";

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword:     string;
}

interface ChangePasswordResult {
  success: boolean;
  error?:  string;
}

// ── Error normaliser ───────────────────────────────────────────────────────────
function normaliseError(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const ax  = err as { response?: { data?: { error?: { message?: string } } } };
    const msg = ax.response?.data?.error?.message ?? "";
    if (msg.includes("incorrect")) return "Current password is incorrect. Please try again.";
    if (msg.includes("different")) return "New password must be different from your current password.";
    if (msg)                       return msg;
  }
  return "Password change failed. Please try again.";
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useChangePassword() {
  const [isPending, setIsPending] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }: ChangePasswordPayload): Promise<ChangePasswordResult> => {
      setIsPending(true);
      setError(null);
      setSuccess(false);

      try {
        await api.post("/auth/change-password", { currentPassword, newPassword });
        setSuccess(true);
        return { success: true };
      } catch (err) {
        const message = normaliseError(err);
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { changePassword, isPending, error, success, reset };
}

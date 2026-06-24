"use client";

import { useState, useEffect }    from "react";
import { useRouter }               from "next/navigation";
import Link                        from "next/link";
import Image                       from "next/image";
import { HiEye, HiEyeSlash, HiArrowLeft } from "react-icons/hi2";
import { useAuth }                 from "@/hooks/useAuth";
import { useChangePassword }       from "@/hooks/useChangePassword";
import PasswordStrengthMeter       from "@/components/auth/PasswordStrengthMeter";
import type { UserRole }            from "@/types/auth";

const ROLE_REDIRECT: Record<UserRole, string> = {
  admin:   "/admin",
  teacher: "/teacher",
  student: "/student",
};

export default function ChangePasswordPage() {
  const router                                = useRouter();
  const { user, isAuthenticated, isLoading }  = useAuth();
  const { changePassword, isPending, error }  = useChangePassword();

  const [current,    setCurrent]    = useState("");
  const [next,       setNext]       = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [showCur,    setShowCur]    = useState(false);
  const [showNext,   setShowNext]   = useState(false);
  const [localErr,   setLocalErr]   = useState<string | null>(null);
  const [done,       setDone]       = useState(false);

  // Redirect unauthenticated users (client-side guard)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?redirect=/change-password");
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalErr(null);

    if (!current || !next || !confirm) { setLocalErr("All fields are required."); return; }
    if (next !== confirm)               { setLocalErr("New password and confirmation do not match."); return; }
    if (next.length < 8)                { setLocalErr("New password must be at least 8 characters."); return; }

    const result = await changePassword({ currentPassword: current, newPassword: next });
    if (result.success) {
      setDone(true);
      setTimeout(() => {
        router.push(ROLE_REDIRECT[user?.role ?? "student"] ?? "/dashboard");
      }, 2000);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-brand-blue/30 border-t-brand-blue animate-spin" />
      </div>
    );
  }

  const displayError = localErr ?? error;

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">

      <div className="px-7 py-5">
        <Link href="/">
          <Image src="/logo.svg" alt="Questify" width={120} height={30} className="h-[30px] w-auto" />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">
          <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.09)] p-8 md:p-9">

            {done ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-brand-dark mb-2">Password updated!</h2>
                <p className="text-[15px] text-brand-body">Redirecting you to your dashboard…</p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-brand-dark mb-1.5">Change password</h1>
                <p className="text-[15px] text-brand-body mb-7">
                  {user ? `Updating password for ${user.email}` : "Update your account password"}
                </p>

                {displayError && (
                  <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {displayError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-brand-dark">Current password</label>
                    <div className="relative">
                      <input
                        type={showCur ? "text" : "password"}
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                        placeholder="Your current password"
                        required
                        disabled={isPending}
                        className="w-full h-11 px-4 pr-11 border border-brand-border rounded-lg text-[15px] text-brand-dark placeholder:text-brand-body/40 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors disabled:opacity-60"
                      />
                      <button type="button" onClick={() => setShowCur((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-body/50 hover:text-brand-body" tabIndex={-1}>
                        {showCur ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-brand-dark">New password</label>
                    <div className="relative">
                      <input
                        type={showNext ? "text" : "password"}
                        value={next}
                        onChange={(e) => setNext(e.target.value)}
                        placeholder="Create a strong password"
                        required
                        disabled={isPending}
                        className="w-full h-11 px-4 pr-11 border border-brand-border rounded-lg text-[15px] text-brand-dark placeholder:text-brand-body/40 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors disabled:opacity-60"
                      />
                      <button type="button" onClick={() => setShowNext((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-body/50 hover:text-brand-body" tabIndex={-1}>
                        {showNext ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
                      </button>
                    </div>
                    <PasswordStrengthMeter password={next} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-brand-dark">Confirm new password</label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      disabled={isPending}
                      className="w-full h-11 px-4 border border-brand-border rounded-lg text-[15px] text-brand-dark placeholder:text-brand-body/40 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors disabled:opacity-60"
                    />
                    {confirm && next && confirm !== next && (
                      <p className="text-[11px] text-red-500">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isPending || !current || !next || !confirm}
                    className="w-full h-11 bg-brand-blue hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors duration-150 mt-1 flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving…</>
                    ) : "Update password"}
                  </button>
                </form>

                <Link href={ROLE_REDIRECT[user?.role ?? "student"] ?? "/dashboard"} className="mt-5 flex items-center gap-1.5 text-[13px] font-semibold text-brand-blue hover:text-[#004182] transition-colors w-fit">
                  <HiArrowLeft size={14} />
                  Back to dashboard
                </Link>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

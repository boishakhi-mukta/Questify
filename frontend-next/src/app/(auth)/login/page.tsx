"use client";

import { useState }              from "react";
import Link                       from "next/link";
import Image                      from "next/image";
import { DotLottieReact }         from "@lottiefiles/dotlottie-react";
import { HiEye, HiEyeSlash }     from "react-icons/hi2";
import { useAuth }                from "@/hooks/useAuth";
import ForcePasswordChangeModal   from "@/components/auth/ForcePasswordChangeModal";
import type { UserRole }           from "@/types/auth";
import { useTranslation }         from "react-i18next";

// ── Demo shortcut accounts ─────────────────────────────────────────────────────
const DEMO_PASSWORD = "DemoPass123!";

const DEMO_ACCOUNTS = [
  { labelKey: "auth.demoStudent", email: "student@demo.com",  role: "student" as UserRole },
  { labelKey: "auth.demoTeacher", email: "faculty@demo.com",  role: "teacher" as UserRole },
  { labelKey: "auth.demoAdmin",   email: "admin@demo.com",    role: "admin"   as UserRole },
] as const;


// ── Role badge colour ──────────────────────────────────────────────────────────
const DEMO_BADGE: Record<UserRole, string> = {
  student: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
  teacher: "bg-emerald-50 text-emerald-700 border-emerald-200",
  admin:   "bg-violet-50 text-violet-700 border-violet-200",
};

export default function LoginPage() {
  const { login, isLoggingIn, loginError, user } = useAuth();
  const { t } = useTranslation();

  const [email,          setEmail]          = useState("");
  const [password,       setPassword]       = useState("");
  const [showPassword,   setShowPassword]   = useState(false);
  const [showForceModal, setShowForceModal] = useState(false);
  const [demoLoading,    setDemoLoading]    = useState<UserRole | null>(null);

  // ── Form submit ────────────────────────────────────────────────────────────
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email.trim() || !password) return;

    const result = await login(email.trim(), password);
    if (result.success && result.requiresPasswordChange) {
      setShowForceModal(true);
    }
  }

  // ── Demo login: authenticate with pre-seeded demo credentials ─────────────
  async function handleDemoLogin(email: string, role: UserRole) {
    setDemoLoading(role);
    await login(email, DEMO_PASSWORD);
    setDemoLoading(null);
  }

  // If forced-change is resolved, user will be in context — derive role
  const activeRole = user?.role ?? "student";

  return (
    <>
      {showForceModal && <ForcePasswordChangeModal userRole={activeRole} />}

      <div className="min-h-screen bg-brand-bg flex flex-col">

        {/* Logo bar */}
        <div className="px-7 py-5">
          <Link href="/">
            <Image src="/logo.svg" alt="Questify" width={120} height={30} className="h-[30px] w-auto" />
          </Link>
        </div>

        {/* Main */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-12">

            {/* Left — Lottie animation */}
            <div className="flex-1 hidden md:flex items-center justify-center">
              <DotLottieReact
                src="/Educatin.lottie"
                loop
                autoplay
                className="w-full max-w-[460px]"
              />
            </div>

            {/* Right — Login card */}
            <div className="flex-1 w-full max-w-[420px]">
              <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.09)] p-8 md:p-9">

                <h1 className="text-2xl font-bold text-brand-dark mb-1.5">{t("auth.welcomeBack")}</h1>
                <p className="text-[15px] text-brand-body mb-7">{t("auth.signInSubtitle")}</p>

                {/* Error banner */}
                {loginError && (
                  <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-brand-dark">{t("auth.emailAddress")}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      disabled={isLoggingIn}
                      className="w-full h-11 px-4 border border-brand-border rounded-lg text-[15px] text-brand-dark placeholder:text-brand-body/40 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors disabled:opacity-60 disabled:bg-brand-bg"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-brand-dark">{t("auth.password")}</label>
                      <Link
                        href="/forgot-password"
                        className="text-[13px] text-brand-blue hover:text-[#004182] font-medium transition-colors"
                      >
                        {t("auth.forgotPassword")}
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        disabled={isLoggingIn}
                        className="w-full h-11 px-4 pr-11 border border-brand-border rounded-lg text-[15px] text-brand-dark placeholder:text-brand-body/40 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors disabled:opacity-60 disabled:bg-brand-bg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-body/50 hover:text-brand-body transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <HiEyeSlash size={19} /> : <HiEye size={19} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoggingIn || !email || !password}
                    className="w-full h-11 bg-brand-blue hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors duration-150 mt-1 flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        {t("auth.signingIn")}
                      </>
                    ) : (
                      t("auth.signIn")
                    )}
                  </button>
                </form>

                {/* Demo accounts divider */}
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-brand-border" />
                    <span className="text-[12px] font-semibold text-brand-body/50 uppercase tracking-wider whitespace-nowrap">
                      {t("auth.tryDemoAccounts")}
                    </span>
                    <div className="flex-1 h-px bg-brand-border" />
                  </div>

                  <div className="flex flex-col gap-2">
                    {DEMO_ACCOUNTS.map(({ labelKey, email: dEmail, role }) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleDemoLogin(dEmail, role)}
                        disabled={isLoggingIn}
                        className="w-full h-10 flex items-center justify-between px-4 border border-brand-border rounded-lg text-[13px] font-semibold transition-all duration-150 hover:border-brand-blue/40 hover:bg-brand-bg disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span className="text-brand-dark flex items-center gap-2">
                          {demoLoading === role && (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-brand-blue/30 border-t-brand-blue animate-spin" />
                          )}
                          {t(labelKey)}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${DEMO_BADGE[role]}`}>
                          {role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-center text-[11px] text-brand-body/45">
                    {t("auth.demoAccountsNote")}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

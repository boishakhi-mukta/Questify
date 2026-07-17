"use client";

import { useState }             from "react";
import Link                      from "next/link";
import { DotLottieReact }        from "@lottiefiles/dotlottie-react";
import { HiEye, HiEyeSlash }    from "react-icons/hi2";
import { GraduationCap, BookOpen, ShieldCheck, Zap, Flame, Trophy, Target } from "lucide-react";
import type { LucideIcon }        from "lucide-react";
import { useAuth }               from "@/hooks/useAuth";
import ForcePasswordChangeModal  from "@/components/auth/ForcePasswordChangeModal";
import { QuestifyLogo }          from "@/components/ui/QuestifyLogo";
import type { UserRole }          from "@/types/auth";
import { useTranslation }        from "react-i18next";

const HERO_BG = "linear-gradient(180deg, #c4dcd0 0%, #d4ede3 28%, #eef8f4 65%, #F2FAF7 100%)";
const LEFT_BG = "linear-gradient(160deg, #b7d3c5 0%, #c8e0d5 40%, #daeee6 80%, #eaf6f1 100%)";

const DEMO_PASSWORD = "DemoPass123!";

const ROLE_CONFIG: {
  role: UserRole;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  demoEmail: string;
}[] = [
  { role: "student", label: "Student", icon: GraduationCap, placeholder: "student@university.edu", demoEmail: "student@demo.com" },
  { role: "teacher", label: "Faculty", icon: BookOpen,       placeholder: "faculty@university.edu", demoEmail: "faculty@demo.com" },
  { role: "admin",   label: "Admin",   icon: ShieldCheck,    placeholder: "admin@university.edu",   demoEmail: "admin@demo.com"   },
];

// Right-panel glass surface
const GLASS = {
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  borderLeft: "1px solid rgba(255,255,255,0.55)",
} as React.CSSProperties;

export default function LoginPage() {
  const { login, isLoggingIn, loginError, user } = useAuth();
  const { t } = useTranslation();

  const [activeRole,     setActiveRole]     = useState<UserRole>("student");
  const [email,          setEmail]          = useState("");
  const [password,       setPassword]       = useState("");
  const [showPassword,   setShowPassword]   = useState(false);
  const [showForceModal, setShowForceModal] = useState(false);
  const [demoLoading,    setDemoLoading]    = useState(false);

  const cfg = ROLE_CONFIG.find((r) => r.role === activeRole)!;

  function handleRoleSwitch(role: UserRole) {
    setActiveRole(role);
    setEmail("");
    setPassword("");
  }

  async function handleSubmit(e?: { preventDefault(): void }) {
    e?.preventDefault();
    if (!email.trim() || !password) return;
    const result = await login(email.trim(), password);
    if (result.success && result.requiresPasswordChange) setShowForceModal(true);
  }

  async function handleDemoLogin() {
    setDemoLoading(true);
    await login(cfg.demoEmail, DEMO_PASSWORD);
    setDemoLoading(false);
  }

  return (
    <>
      {showForceModal && <ForcePasswordChangeModal userRole={user?.role ?? "student"} />}

      {/* Full screen — homepage hero gradient */}
      <div
        className="min-h-screen flex items-center justify-center p-6 lg:p-12"
        style={{ background: HERO_BG }}
      >
        {/* Floating card */}
        <div
          className="w-full max-w-5xl flex rounded-3xl overflow-hidden"
          style={{
            boxShadow: "0 48px 120px rgba(0,0,0,0.22), 0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)",
            border: "1px solid rgba(255,255,255,0.60)",
          }}
        >

          {/* ── Left panel: mint gradient + lottie ── */}
          <div
            className="hidden lg:flex flex-col items-center justify-center flex-1 px-10 py-16 relative overflow-hidden"
            style={{ background: LEFT_BG }}
          >
            {/* Decorative blobs */}
            <div
              className="absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: "rgba(27,67,50,0.04)" }}
            />
            <div
              className="absolute -bottom-16 -right-14 w-52 h-52 rounded-full pointer-events-none"
              style={{ background: "rgba(37,181,133,0.07)" }}
            />

            <style>{`
              @keyframes qf-f1 { 0%,100%{transform:translateY(0) rotate(0deg)}   50%{transform:translateY(-10px) rotate(4deg)}  }
              @keyframes qf-f2 { 0%,100%{transform:translateY(-8px) rotate(-3deg)} 50%{transform:translateY(2px) rotate(2deg)}  }
              @keyframes qf-f3 { 0%,100%{transform:translateY(0) rotate(2deg)}   50%{transform:translateY(-12px) rotate(-2deg)} }
              @keyframes qf-f4 { 0%,100%{transform:translateY(-5px) rotate(0deg)} 50%{transform:translateY(6px) rotate(-4deg)}  }
              @keyframes qf-f5 { 0%,100%{transform:translateY(0) rotate(-2deg)}  50%{transform:translateY(-9px) rotate(3deg)}   }
              @keyframes qf-f6 { 0%,100%{transform:translateY(-6px) rotate(3deg)} 50%{transform:translateY(4px) rotate(-1deg)}  }
              @keyframes qf-f7 { 0%,100%{transform:translateY(0) rotate(-1deg)}  50%{transform:translateY(-7px) rotate(4deg)}   }
            `}</style>

            {/* GraduationCap — top-left */}
            <div className="absolute z-20 w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ top:"8%", left:"10%", background:"rgba(255,255,255,0.72)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.65)", boxShadow:"0 4px 16px rgba(0,0,0,0.10)", animation:"qf-f1 3.6s ease-in-out infinite" }}>
              <GraduationCap size={20} strokeWidth={1.8} style={{ color:"#25B585" }} />
            </div>

            {/* Zap (XP) — top-right */}
            <div className="absolute z-20 w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ top:"12%", right:"9%", background:"rgba(255,255,255,0.72)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.65)", boxShadow:"0 4px 16px rgba(0,0,0,0.10)", animation:"qf-f2 3.1s ease-in-out infinite 0.4s" }}>
              <Zap size={17} strokeWidth={2} style={{ color:"#D97706" }} />
            </div>

            {/* Flame (streak) — mid-left */}
            <div className="absolute z-20 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ top:"44%", left:"5%", background:"rgba(255,255,255,0.72)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.65)", boxShadow:"0 4px 16px rgba(0,0,0,0.10)", animation:"qf-f3 4.2s ease-in-out infinite 0.9s" }}>
              <Flame size={16} strokeWidth={1.9} style={{ color:"#EF4444" }} />
            </div>

            {/* Trophy — mid-right */}
            <div className="absolute z-20 w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ top:"36%", right:"6%", background:"rgba(255,255,255,0.72)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.65)", boxShadow:"0 4px 16px rgba(0,0,0,0.10)", animation:"qf-f4 3.8s ease-in-out infinite 1.3s" }}>
              <Trophy size={22} strokeWidth={1.8} style={{ color:"#CA8A04" }} />
            </div>

            {/* Target — bottom-left */}
            <div className="absolute z-20 w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ bottom:"18%", left:"9%", background:"rgba(255,255,255,0.72)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.65)", boxShadow:"0 4px 16px rgba(0,0,0,0.10)", animation:"qf-f5 3.4s ease-in-out infinite 0.6s" }}>
              <Target size={18} strokeWidth={1.9} style={{ color:"#7C3AED" }} />
            </div>

            {/* BookOpen — bottom-right */}
            <div className="absolute z-20 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ bottom:"14%", right:"11%", background:"rgba(255,255,255,0.72)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.65)", boxShadow:"0 4px 16px rgba(0,0,0,0.10)", animation:"qf-f6 4.5s ease-in-out infinite 1.8s" }}>
              <BookOpen size={16} strokeWidth={1.9} style={{ color:"#1B4332" }} />
            </div>

            {/* ShieldCheck — bottom-right mid */}
            <div className="absolute z-20 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ bottom:"38%", right:"5%", background:"rgba(255,255,255,0.72)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.65)", boxShadow:"0 4px 16px rgba(0,0,0,0.10)", animation:"qf-f7 2.9s ease-in-out infinite 2.2s" }}>
              <ShieldCheck size={14} strokeWidth={2} style={{ color:"#0EA5E9" }} />
            </div>

            {/* Lottie */}
            <div className="relative z-10 w-full max-w-sm">
              <DotLottieReact src="/Educatin.lottie" loop autoplay />
            </div>

            <div className="relative z-10 text-center mt-5">
              <h2 className="text-[26px] font-extrabold text-brand-dark mb-2 leading-tight">
                Welcome to{" "}
                <span style={{ color: "#25B585" }}>Questify</span>
              </h2>
              <p className="text-brand-body text-[13.5px] leading-relaxed max-w-xs mx-auto">
                Your all-in-one academic platform — courses, grades, attendance, and materials in one place.
              </p>
            </div>
          </div>

          {/* ── Right panel: glass form card ── */}
          <div
            className="flex-1 flex flex-col items-center justify-center px-10 py-14"
            style={{
              ...GLASS,
              boxShadow: "-8px 0 32px rgba(0,0,0,0.06)",
            }}
          >
            <div className="w-full max-w-sm">

              {/* Logo */}
              <div className="flex justify-center mb-7">
                <Link href="/">
                  <QuestifyLogo size="md" variant="light" />
                </Link>
              </div>

              {/* "Login as" label */}
              <p className="text-center text-[11px] font-semibold text-brand-body/45 uppercase tracking-widest mb-3">
                Login as
              </p>

              {/* Role tab switcher — glassmorphism buttons */}
              <div
                className="grid grid-cols-3 gap-2 p-2 rounded-2xl mb-7"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              >
                {ROLE_CONFIG.map(({ role, label, icon: Icon }) => {
                  const active = activeRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleSwitch(role)}
                      className="h-10 rounded-xl text-[12.5px] font-semibold transition-all flex items-center justify-center gap-1.5"
                      style={active ? {
                        background: "rgba(255,255,255,0.82)",
                        backdropFilter: "blur(14px)",
                        WebkitBackdropFilter: "blur(14px)",
                        border: "1px solid rgba(255,255,255,0.75)",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
                        color: "#1B4332",
                      } : {
                        background: "rgba(255,255,255,0.22)",
                        border: "1px solid rgba(255,255,255,0.20)",
                        color: "rgba(43,73,58,0.55)",
                      }}
                    >
                      <Icon size={13} strokeWidth={2.2} />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Error banner */}
              {loginError && (
                <div className="mb-5 px-4 py-3 bg-red-50/80 border border-red-200 rounded-xl text-sm text-red-700">
                  {loginError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-brand-body">
                    {t("auth.emailAddress")}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={cfg.placeholder}
                    required
                    autoComplete="email"
                    disabled={isLoggingIn}
                    className="w-full h-11 px-4 border border-brand-border rounded-2xl text-[14px] text-brand-dark placeholder:text-brand-body/30 bg-white/70 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-brand-body">
                    {t("auth.password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      disabled={isLoggingIn}
                      className="w-full h-11 px-4 pr-11 border border-brand-border rounded-2xl text-[14px] text-brand-dark placeholder:text-brand-body/30 bg-white/70 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-body/40 hover:text-brand-body transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <HiEyeSlash size={17} /> : <HiEye size={17} />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-[12.5px] text-brand-blue hover:underline">
                      {t("auth.forgotPassword")}
                    </Link>
                  </div>
                </div>

                {/* Sign In — primary brand colour */}
                <button
                  type="submit"
                  disabled={isLoggingIn || !email || !password}
                  className="w-full h-11 rounded-2xl text-white text-[14px] font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all mt-1 hover:brightness-105"
                  style={{ background: "linear-gradient(135deg, #30d99a 0%, #25B585 55%, #1da870 100%)", boxShadow: "0 4px 18px rgba(37,181,133,0.45)" }}
                >
                  {isLoggingIn && !demoLoading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      {t("auth.signingIn")}
                    </>
                  ) : (
                    <>
                      <cfg.icon size={15} strokeWidth={2.2} />
                      {t("auth.signIn")} as {cfg.label}
                    </>
                  )}
                </button>
              </form>

              {/* Demo quick login — single context-aware button */}
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: "rgba(27,67,50,0.12)" }} />
                  <span className="text-[11px] font-semibold text-brand-body/40 uppercase tracking-wider whitespace-nowrap">
                    {t("auth.tryDemoAccounts")}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "rgba(27,67,50,0.12)" }} />
                </div>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoggingIn}
                  className="w-full h-10 rounded-2xl border border-brand-border bg-white/60 text-[13px] font-medium text-brand-dark flex items-center justify-center gap-2 hover:bg-white hover:border-brand-blue/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {demoLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-brand-blue/30 border-t-brand-blue animate-spin" />
                      {t("auth.signingIn")}
                    </>
                  ) : (
                    <>
                      <cfg.icon size={14} strokeWidth={2.2} className="text-brand-blue" />
                      Quick demo — {cfg.label}
                    </>
                  )}
                </button>

                <p className="mt-2.5 text-center text-[11px] text-brand-body/35">
                  {t("auth.demoAccountsNote")}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}

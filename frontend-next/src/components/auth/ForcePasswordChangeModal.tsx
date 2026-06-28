"use client";

import { useState }             from "react";
import { useRouter }             from "next/navigation";
import { HiEye, HiEyeSlash }    from "react-icons/hi2";
import { useChangePassword }     from "@/hooks/useChangePassword";
import { useAuthContext }         from "@/contexts/AuthContext";
import PasswordStrengthMeter     from "@/components/auth/PasswordStrengthMeter";
import type { UserRole }          from "@/types/auth";
import { useTranslation }        from "react-i18next";

const ROLE_REDIRECT: Record<UserRole, string> = {
  admin:   "/admin",
  teacher: "/teacher",
  student: "/student",
};

interface Props {
  userRole: UserRole;
}

export default function ForcePasswordChangeModal({ userRole }: Props) {
  const router                           = useRouter();
  const { updateUser }                   = useAuthContext();
  const { changePassword, isPending, error } = useChangePassword();
  const { t }                            = useTranslation();

  const [current,  setCurrent]  = useState("");
  const [next,     setNext]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showCur,  setShowCur]  = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setLocalErr(null);

    if (!current || !next || !confirm) {
      setLocalErr(t("auth.allFieldsRequired"));
      return;
    }
    if (next !== confirm) {
      setLocalErr(t("auth.passwordMismatch"));
      return;
    }
    if (next.length < 8) {
      setLocalErr(t("auth.passwordTooShort"));
      return;
    }

    const result = await changePassword({ currentPassword: current, newPassword: next });

    if (result.success) {
      updateUser({ requiresPasswordChange: false });
      router.push(ROLE_REDIRECT[userRole] ?? "/dashboard");
    }
  }

  const displayError = localErr ?? error;

  return (
    // Full-screen overlay — cannot be dismissed
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-brand-dark">{t("auth.createPermanentPassword")}</h2>
          <p className="text-sm text-brand-body mt-1.5">
            {t("auth.temporaryPasswordNote")}
          </p>
        </div>

        {/* Error */}
        {displayError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Current (temp) password */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-brand-dark">{t("auth.temporaryPassword")}</label>
            <div className="relative">
              <input
                type={showCur ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder={t("auth.tempPasswordPlaceholder")}
                className="w-full h-11 px-4 pr-10 border border-brand-border rounded-lg text-[15px] text-brand-dark placeholder:text-brand-body/40 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors"
                disabled={isPending}
                required
              />
              <button
                type="button"
                onClick={() => setShowCur((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-body/50 hover:text-brand-body transition-colors"
                tabIndex={-1}
              >
                {showCur ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-brand-dark">{t("auth.newPassword")}</label>
            <div className="relative">
              <input
                type={showNext ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder={t("auth.newPasswordPlaceholder")}
                className="w-full h-11 px-4 pr-10 border border-brand-border rounded-lg text-[15px] text-brand-dark placeholder:text-brand-body/40 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors"
                disabled={isPending}
                required
              />
              <button
                type="button"
                onClick={() => setShowNext((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-body/50 hover:text-brand-body transition-colors"
                tabIndex={-1}
              >
                {showNext ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
              </button>
            </div>
            <PasswordStrengthMeter password={next} />
          </div>

          {/* Confirm */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-brand-dark">{t("auth.confirmNewPassword")}</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t("auth.confirmPasswordPlaceholder")}
              className="w-full h-11 px-4 border border-brand-border rounded-lg text-[15px] text-brand-dark placeholder:text-brand-body/40 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors"
              disabled={isPending}
              required
            />
            {confirm && next && confirm !== next && (
              <p className="text-[11px] text-red-500 mt-1">{t("auth.passwordsDoNotMatch")}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-brand-blue hover:bg-[#004182] disabled:opacity-60 text-white font-bold rounded-lg transition-colors duration-150 mt-2"
          >
            {isPending ? t("auth.saving") : t("auth.setNewPassword")}
          </button>
        </form>

      </div>
    </div>
  );
}

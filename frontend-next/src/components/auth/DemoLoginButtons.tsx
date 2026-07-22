"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: DemoLoginButtons
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A set of helper buttons to automatically log in as an Admin, Teacher, or Student.
 * 
 * WHY IT EXISTS:
 * Speeds up internal development and client demonstrations by bypassing credential typing.
 * 
 * HOW IT WORKS (Technical Overview):
 * Submits preconfigured credentials to authentication services on single clicks.
 * ============================================================================
 */

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const DEMO_ACCOUNT_HREFS = [
  { labelKey: "auth.demoStudent", href: "/demo/student" },
  { labelKey: "auth.demoTeacher", href: "/demo/teacher" },
  { labelKey: "auth.demoAdmin",   href: "/demo/admin"   },
] as const;

// Shows three "try it as..." buttons (Student/Teacher/Admin) that instantly
// sign a visitor into a demo account, without them needing real credentials.
export function DemoLoginButtons() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-[400px]">
      <div className="mt-5 pt-5 border-t border-gray-200">
        <p className="text-center text-[13px] font-medium text-gray-400 uppercase tracking-wide mb-3">
          {t("auth.tryDemoAccounts")}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNT_HREFS.map(({ labelKey, href }) => (
            <button
              key={href}
              type="button"
              onClick={() => router.push(href)}
              className="px-3 py-2.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg transition-all duration-150 hover:bg-brand-blue-light hover:text-brand-blue hover:border-brand-blue/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

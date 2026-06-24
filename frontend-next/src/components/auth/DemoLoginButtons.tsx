"use client";

import { useRouter } from "next/navigation";

const DEMO_ACCOUNTS = [
  { label: "Demo Student", href: "/demo/student" },
  { label: "Demo Teacher", href: "/demo/teacher" },
  { label: "Demo Admin",   href: "/demo/admin"   },
] as const;

export function DemoLoginButtons() {
  const router = useRouter();

  return (
    <div className="w-full max-w-[400px]">
      <div className="mt-5 pt-5 border-t border-gray-200">
        <p className="text-center text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Try Demo Accounts
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map(({ label, href }) => (
            <button
              key={href}
              type="button"
              onClick={() => router.push(href)}
              className="px-3 py-2.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg transition-all duration-150 hover:bg-brand-blue-light hover:text-brand-blue hover:border-brand-blue/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

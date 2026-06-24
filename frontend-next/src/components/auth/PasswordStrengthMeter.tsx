"use client";

import { cn } from "@/lib/utils";

interface Check {
  label: string;
  passed: boolean;
}

function evaluate(password: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string; checks: Check[] } {
  const checks: Check[] = [
    { label: "At least 8 characters",         passed: password.length >= 8 },
    { label: "Uppercase letter (A-Z)",         passed: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a-z)",         passed: /[a-z]/.test(password) },
    { label: "Number (0-9)",                   passed: /\d/.test(password) },
    { label: "Special character (!@#$…)",      passed: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];

  const passed = checks.filter((c) => c.passed).length;

  if (!password)    return { score: 0, label: "",           color: "",                    checks };
  if (passed <= 1)  return { score: 1, label: "Very weak",  color: "bg-red-500",          checks };
  if (passed === 2) return { score: 2, label: "Weak",       color: "bg-orange-500",       checks };
  if (passed === 3) return { score: 3, label: "Fair",       color: "bg-yellow-400",       checks };
  if (passed === 4) return { score: 4, label: "Good",       color: "bg-brand-blue",       checks };
  return              { score: 4, label: "Strong",           color: "bg-green-500",        checks };
}

const labelColor: Record<number, string> = {
  0: "text-transparent",
  1: "text-red-500",
  2: "text-orange-500",
  3: "text-yellow-600",
  4: "text-green-600",
};

export default function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label, color, checks } = evaluate(password);

  if (!password) return null;

  return (
    <div className="mt-1.5 space-y-1.5">
      {/* Bar */}
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-all duration-300",
              i <= score ? color : "bg-brand-border"
            )}
          />
        ))}
      </div>

      {/* Label */}
      <p className={cn("text-[11px] font-semibold", labelColor[score] ?? "text-transparent")}>
        {label}
      </p>

      {/* Checklist — only show unmet requirements */}
      {checks.filter((c) => !c.passed).length > 0 && (
        <ul className="space-y-0.5">
          {checks.map((c) => (
            !c.passed && (
              <li key={c.label} className="text-[11px] text-brand-body/60 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-brand-body/30" />
                {c.label}
              </li>
            )
          ))}
        </ul>
      )}
    </div>
  );
}

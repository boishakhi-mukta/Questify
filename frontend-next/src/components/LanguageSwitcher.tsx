"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "no", label: "Norsk",   flag: "🇳🇴" },
] as const;

type LangCode = (typeof LANGUAGES)[number]["code"];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef    = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  function changeLang(code: LangCode) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Language: ${current.label}`}
        className={cn(
          "flex items-center gap-1.5 h-9 px-2.5 rounded-md text-[13px] font-medium",
          "text-brand-body dark:text-white/55",
          "hover:text-brand-dark dark:hover:text-white",
          "hover:bg-brand-bg dark:hover:bg-white/8",
          "transition-colors"
        )}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-slate-900 border border-brand-border dark:border-white/10 rounded-lg shadow-lg overflow-hidden z-50"
        >
          {LANGUAGES.map((lang) => {
            const isActive = lang.code === i18n.language;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => changeLang(lang.code)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] transition-colors",
                  isActive
                    ? "font-semibold text-brand-blue bg-brand-blue-light dark:bg-brand-blue/10"
                    : "font-medium text-brand-dark dark:text-white/80 hover:bg-brand-bg dark:hover:bg-white/8"
                )}
              >
                <span className="text-base leading-none">{lang.flag}</span>
                {lang.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

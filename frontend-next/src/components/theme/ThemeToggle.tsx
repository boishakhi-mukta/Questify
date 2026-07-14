"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: ThemeToggle
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A small toggle button (usually showing a sun or moon icon) to switch dark/light mode.
 * 
 * WHY IT EXISTS:
 * Comfort configuration for users to adjust layout brightness to their environments.
 * 
 * HOW IT WORKS (Technical Overview):
 * Inspects and modifies the theme state using next-themes' useTheme hook.
 * ============================================================================
 */

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { HiSun, HiMoon } from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  /** "icon" = compact navbar button; "sidebar" = full-width with label */
  variant?: "icon" | "sidebar";
  className?: string;
}

export function ThemeToggle({ variant = "sidebar", className }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return variant === "icon"
      ? <div className={cn("w-9 h-9 rounded-md shrink-0", className)} />
      : <div className="w-full h-10 rounded-md bg-white/5 animate-pulse" />;
  }

  const isDark = resolvedTheme === "dark";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-md shrink-0",
          "text-brand-body dark:text-white/55",
          "hover:text-brand-dark dark:hover:text-white",
          "hover:bg-brand-bg dark:hover:bg-white/8",
          "transition-colors",
          className
        )}
      >
        {isDark ? <HiSun size={19} /> : <HiMoon size={19} />}
      </button>
    );
  }

  // sidebar variant (original style)
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium",
        "text-white/55 hover:text-white hover:bg-white/8 transition-colors duration-150",
        className
      )}
    >
      {isDark ? <HiSun size={16} /> : <HiMoon size={16} />}
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

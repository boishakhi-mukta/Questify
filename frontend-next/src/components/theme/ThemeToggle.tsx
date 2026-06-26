"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { HiSun, HiMoon } from "react-icons/hi2";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // Avoid hydration mismatch — render nothing until mounted
  useEffect(() => setMounted(true), []);
  if (!mounted) return (
    <div className="w-full h-10 rounded-md bg-white/5 animate-pulse" />
  );

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium text-white/55 hover:text-white hover:bg-white/8 transition-colors duration-150"
    >
      {isDark ? <HiSun size={16} /> : <HiMoon size={16} />}
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

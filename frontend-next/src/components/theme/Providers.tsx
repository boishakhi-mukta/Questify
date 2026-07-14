"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: Providers
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A top-level container wrapping the entire application to set dark mode and UI presets.
 * 
 * WHY IT EXISTS:
 * Allows user theme preferences to persist across pages and visits.
 * 
 * HOW IT WORKS (Technical Overview):
 * Integrates HeroUI Provider and next-themes ThemeProvider to apply dark/light classes.
 * ============================================================================
 */

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/components/I18nProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
      >
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

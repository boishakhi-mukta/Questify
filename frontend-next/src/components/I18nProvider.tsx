"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: I18nProvider
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The background translator engine that handles multi-language support across the site.
 * 
 * WHY IT EXISTS:
 * Keeps the website language settings synced and loads translation dictionary files.
 * 
 * HOW IT WORKS (Technical Overview):
 * Wraps Next.js pages in an internationalization provider, initializing resources.
 * ============================================================================
 */

import "@/lib/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import type { ReactNode } from "react";

export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

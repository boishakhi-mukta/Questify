/**
 * ============================================================================
 * QUESTIFY LIBRARY: i18n Configuration
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Configures the multi-language translator modules.
 * 
 * WHY IT EXISTS:
 * Manages localization definitions globally.
 * 
 * HOW IT WORKS (Technical Overview):
 * Initializes i18next libraries linking language translation templates.
 * ============================================================================
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "@/locales/en.json";
import no from "@/locales/no.json";

// Only set up the translator once — without this check, Next.js's hot-reload
// during development would try to re-initialize it repeatedly and error out.
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        no: { translation: no },
      },
      fallbackLng: "en",
      supportedLngs: ["en", "no"],
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: "questify_lang",
        caches: ["localStorage"],
      },
      interpolation: { escapeValue: false },
    });
}

export default i18n;

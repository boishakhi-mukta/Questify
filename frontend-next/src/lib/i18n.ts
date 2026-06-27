import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "@/locales/en.json";
import no from "@/locales/no.json";

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

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Import translations
import enTranslation from "./locales/en/translation.json";
import koTranslation from "./locales/ko/translation.json";
import frTranslation from "./locales/fr/translation.json";
import zhCNTranslation from "./locales/zh-CN/translation.json";
import zhTWTranslation from "./locales/zh-TW/translation.json";
import deTranslation from "./locales/de/translation.json";
import jaTranslation from "./locales/ja/translation.json";

// Define the resources containing translations
const resources = {
  en: {
    translation: enTranslation,
  },
  ko: {
    translation: koTranslation,
  },
  fr: {
    translation: frTranslation,
  },
  "zh-CN": {
    translation: zhCNTranslation,
  },
  "zh-TW": {
    translation: zhTWTranslation,
  },
  de: {
    translation: deTranslation,
  },
  ja: {
    translation: jaTranslation,
  },
};

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    // Check if we're in development mode (simpler approach)
    debug:
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1",

    interpolation: {
      escapeValue: false, // React already safes from XSS
    },

    // Language detection options
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator"],
      lookupQuerystring: "lng",
      lookupCookie: "i18next",
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage", "cookie"],
    },
  });

export default i18n;

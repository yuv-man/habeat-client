import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonEn from "@/locales/en/common.json";
import commonHe from "@/locales/he/common.json";
import navigationEn from "@/locales/en/navigation.json";
import myMealsEn from "@/locales/en/myMeals.json";
import navigationHe from "@/locales/he/navigation.json";
import myMealsHe from "@/locales/he/myMeals.json";
import settingsEn from "@/locales/en/settings.json";
import settingsHe from "@/locales/he/settings.json";
import onboardingEn from "@/locales/en/onboarding.json";
import onboardingHe from "@/locales/he/onboarding.json";
import landingEn from "@/locales/en/landing.json";
import landingHe from "@/locales/he/landing.json";

import { storageGetItemSync } from "./storage";

export const SUPPORTED_LANGUAGES = ["en", "he"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Must match the zustand `persist` `name` used in src/stores/languageStore.ts
export const LANGUAGE_STORAGE_KEY = "language-storage";

// Read the persisted language synchronously so i18next boots in the right
// language/direction on the first render instead of flashing English/LTR.
const getPersistedLanguage = (): SupportedLanguage | null => {
  try {
    const raw = storageGetItemSync(LANGUAGE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const lang = parsed?.state?.language;
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)
      ? (lang as SupportedLanguage)
      : null;
  } catch {
    return null;
  }
};

const resources = {
  en: {
    common: commonEn,
    navigation: navigationEn,
    myMeals: myMealsEn,
    settings: settingsEn,
    onboarding: onboardingEn,
    landing: landingEn,
  },
  he: {
    common: commonHe,
    navigation: navigationHe,
    myMeals: myMealsHe,
    settings: settingsHe,
    onboarding: onboardingHe,
    landing: landingHe,
  },
};

export const applyDocumentDirection = (language: string): void => {
  const dir = language === "he" ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getPersistedLanguage() ?? undefined,
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    defaultNS: "common",
    ns: ["common", "navigation", "settings", "onboarding", "landing"],
    // Persistence is owned by languageStore (Capacitor/web-safe storage);
    // the detector is only used to guess a language before any preference
    // has ever been saved.
    detection: {
      order: ["navigator"],
      caches: [],
    },
    interpolation: {
      escapeValue: false,
    },
  });

applyDocumentDirection(i18n.language || "en");

i18n.on("languageChanged", (lng) => {
  applyDocumentDirection(lng);
});

export default i18n;

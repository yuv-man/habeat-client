import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import i18n, {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  applyDocumentDirection,
} from "@/lib/i18n";
import {
  storageGetItemSync,
  storageSetItemSync,
  storageRemoveItemSync,
} from "@/lib/storage";
import { userAPI } from "@/services/api";
import type { IUser } from "@/types/interfaces";

// Same key i18n.ts reads synchronously on boot to avoid a flash of the
// wrong language/direction - keep both in sync if this ever changes.
const STORAGE_NAME = "language-storage";

const syncStorage: StateStorage = {
  getItem: (name) => storageGetItemSync(name),
  setItem: (name, value) => storageSetItemSync(name, value),
  removeItem: (name) => storageRemoveItemSync(name),
};

interface LanguageState {
  language: SupportedLanguage;
}

interface LanguageActions {
  setLanguage: (language: SupportedLanguage, userId?: string) => void;
}

type LanguageStore = LanguageState & LanguageActions;

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: (SUPPORTED_LANGUAGES as readonly string[]).includes(
        i18n.language,
      )
        ? (i18n.language as SupportedLanguage)
        : "en",

      setLanguage: (language, userId) => {
        set({ language });
        i18n.changeLanguage(language);

        if (userId) {
          // Fire-and-forget: persist the preference server-side so it
          // follows the user across devices. Same `Partial as IUser` cast
          // authStore.updateProfile uses for partial profile saves.
          userAPI.updateUser(userId, { language } as IUser).catch((error) => {
            console.error("Failed to persist language preference:", error);
          });
        }
      },
    }),
    {
      name: STORAGE_NAME,
      storage: createJSONStorage(() => syncStorage),
      onRehydrateStorage: () => (state) => {
        // Covers native cold starts where the sync storage cache isn't
        // populated yet when i18n.ts does its own synchronous read.
        if (state?.language) {
          i18n.changeLanguage(state.language);
          applyDocumentDirection(state.language);
        }
      },
    },
  ),
);

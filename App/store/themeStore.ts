import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const THEME_KEY = "crowdshield_theme";

export type ThemePreference = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";

type ThemeState = {
  preference: ThemePreference;
  resolved: ColorScheme;
  hydrated: boolean;

  setPreference: (preference: ThemePreference) => Promise<void>;
  setResolved: (resolved: ColorScheme) => void;
  hydrate: () => Promise<void>;
};

async function loadPreference(): Promise<ThemePreference> {
  try {
    const stored = await SecureStore.getItemAsync(THEME_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {}
  return "system";
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "system",
  resolved: "dark",
  hydrated: false,

  setPreference: async (preference) => {
    try {
      await SecureStore.setItemAsync(THEME_KEY, preference);
    } catch {}
    set({ preference });
  },

  setResolved: (resolved) => set({ resolved }),

  hydrate: async () => {
    const preference = await loadPreference();
    set({ preference, hydrated: true });
  },
}));

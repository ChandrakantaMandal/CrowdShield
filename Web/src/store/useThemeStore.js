import { create } from "zustand";

const STORAGE_KEY = "crowdshield-theme";

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "system" || stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return "system";
};

const applyTheme = (resolved) => {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  resolvedTheme: "light",

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    set({ theme });
  },
}));

const mq = window.matchMedia("(prefers-color-scheme: dark)");

const syncResolvedTheme = () => {
  const { theme, resolvedTheme } = useThemeStore.getState();
  const next =
    theme === "system" ? (mq.matches ? "dark" : "light") : theme;
  if (next !== resolvedTheme) {
    useThemeStore.setState({ resolvedTheme: next });
  }
  applyTheme(next);
};

mq.addEventListener("change", () => {
  const { theme } = useThemeStore.getState();
  if (theme === "system") {
    syncResolvedTheme();
  }
});

useThemeStore.subscribe(() => {
  syncResolvedTheme();
});

if (typeof window !== "undefined") {
  syncResolvedTheme();
}

export default useThemeStore;

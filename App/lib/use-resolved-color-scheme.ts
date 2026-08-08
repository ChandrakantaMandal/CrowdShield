import { useThemeStore, type ColorScheme } from "@/store/themeStore";

export function useResolvedColorScheme(): ColorScheme {
  const preference = useThemeStore((s) => s.preference);

  if (preference === "system") {
    return "dark";
  }
  return preference;
}

import "@/global.css";

import { NAV_THEME } from "@/lib/theme";
import { useResolvedColorScheme } from "@/lib/use-resolved-color-scheme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Platform } from "react-native";

import { supabase } from "@/lib/supabase";
import { RiskNotificationProvider } from "@/components/RiskNotificationProvider";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";

export { ErrorBoundary } from "expo-router";

const BACKGROUND_COLORS: Record<"light" | "dark", string> = {
  light: "#FFFFFF",
  dark: "#0B1220",
};

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const resolved = useResolvedColorScheme();

  useEffect(() => {
    useThemeStore.getState().hydrate();
  }, []);

  useEffect(() => {
    setColorScheme(resolved);
  }, [resolved, setColorScheme]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("inset-swipe");
    }
  }, []);

  return (
    <ThemeProvider value={NAV_THEME[resolved]}>
      <StatusBar style={resolved === "dark" ? "light" : "dark"} />
      <RiskNotificationProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: BACKGROUND_COLORS[resolved],
            },
          }}
        />
      </RiskNotificationProvider>

      <PortalHost />
    </ThemeProvider>
  );
}

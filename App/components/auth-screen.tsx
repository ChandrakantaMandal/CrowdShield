import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

import { useResolvedColorScheme } from "@/lib/use-resolved-color-scheme";

type AuthScreenProps = {
  children: React.ReactNode;
};

export function AuthScreen({ children }: AuthScreenProps) {
  const scheme = useResolvedColorScheme();
  const isDark = scheme === "dark";

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <LinearGradient
        colors={isDark ? ["#0B1220", "#1B1030"] : ["#EEF2F7", "#F4EDF9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerClassName="flex-1 items-center justify-center p-4 py-8 mt-safe"
        >
          <View className="w-full max-w-sm">{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

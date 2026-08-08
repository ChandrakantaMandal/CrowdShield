import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { useResolvedColorScheme } from "@/lib/use-resolved-color-scheme";

export default function AlertsScreen() {
  const scheme = useResolvedColorScheme();
  const isDark = scheme === "dark";

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-slate-50 dark:bg-slate-950"
    >
      <LinearGradient
        colors={isDark ? ["#0B1220", "#1B1030"] : ["#EEF2F7", "#F4EDF9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      <View className="flex-row items-start justify-between p-5">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            Alerts
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            Stay informed on what&apos;s happening nearby.
          </Text>
        </View>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <View className="h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
          <Ionicons
            name="notifications-off-outline"
            size={38}
            color={isDark ? "#2a3a55" : "#CBD5E1"}
          />
        </View>
        <Text className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          No Alerts Yet
        </Text>
        <Text className="mt-1 text-center text-sm leading-relaxed text-slate-500">
          You&apos;ll see verified safety alerts from your community here as they
          are reported.
        </Text>
      </View>
    </SafeAreaView>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { useResolvedColorScheme } from "@/lib/use-resolved-color-scheme";

export default function MapScreen() {
  const scheme = useResolvedColorScheme();
  const isDark = scheme === "dark";

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-slate-50 dark:bg-slate-950"
    >
      <ScrollView
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
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
              Safety Map
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400">
              Live alerts across your neighborhood.
            </Text>
          </View>
        </View>

        {/* Map placeholder */}
        <View className="mx-5 h-72 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
          <Ionicons
            name="map-outline"
            size={48}
            color={isDark ? "#2C3A52" : "#94A3B8"}
          />
          <Text className="mt-3 text-sm text-slate-500">
            Interactive map coming soon
          </Text>
        </View>

        {/* Legend */}
        <View className="mt-6 gap-2 px-5">
          <Text className="text-base font-semibold text-slate-900 dark:text-white">
            Legend
          </Text>
          {[
            { label: "Active alerts", color: "#F43F5E" },
            { label: "Moderate activity", color: "#FDBA3B" },
          ].map((item) => (
            <View
              key={item.label}
              className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <View
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Text className="text-sm text-slate-700 dark:text-slate-300">
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

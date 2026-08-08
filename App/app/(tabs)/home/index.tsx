import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as React from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { Text } from "@/components/ui/text";
import { useResolvedColorScheme } from "@/lib/use-resolved-color-scheme";

const quickActions = [
  {
    label: "View Map",
    icon: "map" as const,
    onPress: () => router.push("/(tabs)/map"),
  },
  {
    label: "Check Alerts",
    icon: "notifications" as const,
    onPress: () => router.push("/(tabs)/alerts"),
  },
];

export default function HomeScreen() {
  const { user, signOut, loading } = useAuthStore();
  const scheme = useResolvedColorScheme();
  const isDark = scheme === "dark";

  const firstName = user?.user_metadata?.full_name?.split(" ")[0];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#FDBA3B" />
      </View>
    );
  }

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

        {/* Header */}
        <View className="flex-row items-start justify-between p-5">
          <View className="gap-1">
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
              {firstName ? `Hi, ${firstName}` : "Welcome"}
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400">
              Your neighborhood, always monitored.
            </Text>
          </View>
          <Pressable
            onPress={signOut}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            className="h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
          >
            <Ionicons
              name="log-out-outline"
              size={18}
              color={isDark ? "#94A3B8" : "#64748B"}
            />
          </Pressable>
        </View>

        {/* Safety status card */}
        <View className="px-5">
          <LinearGradient
            colors={["#FDBA3B", "#F43F5E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="overflow-hidden rounded-3xl p-[1.5px] shadow-lg shadow-rose-500/20"
          >
            <View className="rounded-3xl bg-white dark:bg-[#0C1220] p-5">
              <View className="flex-row items-center justify-between">
                <View className="gap-1">
                  <Text className="text-sm text-slate-500 dark:text-slate-400">
                    Neighborhood Safety
                  </Text>

                  <Text className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    All Clear
                  </Text>
                </View>

                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10">
                  <Ionicons name="shield-checkmark" size={28} color="#34D399" />
                </View>
              </View>

              <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-slate-100 dark:bg-slate-900/60 px-4 py-3">
                <View className="flex-1">
                  <Text className="text-xs text-slate-500 dark:text-slate-500">
                    Active Alerts
                  </Text>
                  <Text className="text-lg font-bold text-slate-900 dark:text-white">
                    0
                  </Text>
                </View>

                <View className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

                <View className="flex-1 items-end">
                  <Text className="text-xs text-slate-500 dark:text-slate-500">
                    Members
                  </Text>
                  <Text className="text-lg font-bold text-slate-900 dark:text-white">
                    486
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick actions */}
        <View className="mt-6 flex-row gap-3 px-5">
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              accessibilityRole="button"
              className="flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 px-2 py-4"
            >
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10">
                <Ionicons name={action.icon} size={18} color="#FDBA3B" />
              </View>
              <Text className="text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Recent activity */}
        <View className="mt-8 gap-3 px-5">
          <Text className="text-base font-semibold text-slate-900 dark:text-white">
            Recent Activity
          </Text>
          <View className="gap-3">
            {[
              {
                icon: "checkmark-circle" as const,
                color: "#34D399",
                title: "Alerts reviewed",
                time: "2h ago",
              },
              {
                icon: "people" as const,
                color: "#818CF8",
                title: "Community verification milestone",
                time: "3d ago",
              },
            ].map((item) => (
              <View
                key={item.title}
                className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-4"
              >
                <View
                  className="h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${item.color}1A` }}
                >
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.title}
                  </Text>
                </View>
                <Text className="text-xs text-slate-500 dark:text-slate-500">
                  {item.time}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

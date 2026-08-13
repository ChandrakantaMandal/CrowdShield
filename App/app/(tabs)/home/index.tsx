import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import {
  getLatestMetrics,
  getRiskEvents,
  type LatestMetrics,
  type RiskEvent,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { usePolling } from "@/lib/use-polling";
import { useResolvedColorScheme } from "@/lib/use-resolved-color-scheme";

const POLL_INTERVAL_MS = 4000;

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

function riskColor(level: string | undefined): string {
  switch (level) {
    case "CRITICAL":
      return "#E11D48";
    case "HIGH":
      return "#F97316";
    case "WARNING":
      return "#FACC15";
    default:
      return "#34D399";
  }
}

function riskLabel(level: string | undefined): string {
  switch (level) {
    case "CRITICAL":
      return "Critical";
    case "HIGH":
      return "High";
    case "WARNING":
      return "Warning";
    default:
      return "All Clear";
  }
}

export default function HomeScreen() {
  const { user, signOut, loading } = useAuthStore();
  const scheme = useResolvedColorScheme();
  const isDark = scheme === "dark";

  const metrics = usePolling<LatestMetrics>({
    fetcher: getLatestMetrics,
    intervalMs: POLL_INTERVAL_MS,
    enabled: !loading,
  });
  const riskEvents = usePolling<RiskEvent[]>({
    fetcher: () => getRiskEvents(1),
    intervalMs: POLL_INTERVAL_MS,
    enabled: !loading,
  });

  const firstName = user?.user_metadata?.full_name?.split(" ")[0];
  const topRisk = riskEvents.data?.[0];
  const color = topRisk ? riskColor(topRisk.risk_level) : "#34D399";
  const label = topRisk ? riskLabel(topRisk.risk_level) : "All Clear";

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#FDBA3B" />
      </View>
    );
  }

  const latest = metrics.data;
  const crowdCards = [
    {
      label: "People",
      value: latest ? String(latest.people_count) : "—",
      icon: "people" as const,
      color: "#818CF8",
    },
    {
      label: "Density",
      value: latest ? `${latest.density.toFixed(1)}/m²` : "—",
      icon: "cellular" as const,
      color: "#38BDF8",
    },
    {
      label: "Avg Speed",
      value: latest ? `${latest.average_speed.toFixed(1)} m/s` : "—",
      icon: "speedometer" as const,
      color: "#FDBA3B",
    },
  ];

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

                  <Text
                    className="text-2xl font-extrabold"
                    style={{ color }}
                  >
                    {riskEvents.error ? "Offline" : label}
                  </Text>
                </View>

                <View
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${color}1A` }}
                >
                  <Ionicons
                    name={
                      topRisk ? "warning" : "shield-checkmark"
                    }
                    size={28}
                    color={color}
                  />
                </View>
              </View>

              <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-slate-100 dark:bg-slate-900/60 px-4 py-3">
                <View className="flex-1">
                  <Text className="text-xs text-slate-500 dark:text-slate-500">
                    Active Alerts
                  </Text>
                  <Text className="text-lg font-bold text-slate-900 dark:text-white">
                    {riskEvents.data?.length ?? 0}
                  </Text>
                </View>

                <View className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

                <View className="flex-1 items-end">
                  <Text className="text-xs text-slate-500 dark:text-slate-500">
                    Zone
                  </Text>
                  <Text className="text-lg font-bold text-slate-900 dark:text-white">
                    {topRisk?.zone_id ?? "—"}
                  </Text>
                </View>
              </View>

              {metrics.error && !latest ? (
                <Text className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                  {metrics.error}
                </Text>
              ) : null}
            </View>
          </LinearGradient>
        </View>

        {/* Live crowd metrics */}
        <View className="mt-6 gap-3 px-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-slate-900 dark:text-white">
              Live Crowd Metrics
            </Text>
            {metrics.refreshing ? (
              <ActivityIndicator size="small" color="#FDBA3B" />
            ) : null}
          </View>

          <View className="flex-row gap-3">
            {crowdCards.map((card) => (
              <View
                key={card.label}
                className="flex-1 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-4"
              >
                <View
                  className="h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${card.color}1A` }}
                >
                  <Ionicons name={card.icon} size={18} color={card.color} />
                </View>
                <Text className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                  {card.value}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-500">
                  {card.label}
                </Text>
              </View>
            ))}
          </View>

          {latest ? (
            <View className="flex-row gap-3">
              <View className="flex-1 flex-row items-center gap-2 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 px-4 py-3">
                <Ionicons
                  name={
                    latest.surge_detected
                      ? "trending-up"
                      : "remove-circle-outline"
                  }
                  size={18}
                  color={latest.surge_detected ? "#F97316" : "#34D399"}
                />
                <Text className="text-xs text-slate-500 dark:text-slate-500">
                  {latest.surge_detected ? "Surge detected" : "No surge"}
                </Text>
              </View>
              <View className="flex-1 flex-row items-center gap-2 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 px-4 py-3">
                <Ionicons
                  name={
                    latest.bottleneck ? "alert-circle" : "remove-circle-outline"
                  }
                  size={18}
                  color={latest.bottleneck ? "#F43F5E" : "#34D399"}
                />
                <Text className="text-xs text-slate-500 dark:text-slate-500">
                  {latest.bottleneck ? "Bottleneck" : "Flow normal"}
                </Text>
              </View>
            </View>
          ) : null}
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

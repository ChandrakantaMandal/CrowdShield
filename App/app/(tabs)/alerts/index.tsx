import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import {
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { getRiskEvents, type RiskEvent } from "@/lib/api";
import { usePolling } from "@/lib/use-polling";
import { useResolvedColorScheme } from "@/lib/use-resolved-color-scheme";

const POLL_INTERVAL_MS = 4000;

function riskColor(level: string): string {
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

function riskIcon(level: string): keyof typeof Ionicons.glyphMap {
  switch (level) {
    case "CRITICAL":
      return "alert-circle";
    case "HIGH":
      return "warning";
    case "WARNING":
      return "information-circle";
    default:
      return "shield-checkmark";
  }
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AlertsScreen() {
  const scheme = useResolvedColorScheme();
  const isDark = scheme === "dark";

  const { data, error, refreshing, refresh } = usePolling<RiskEvent[]>({
    fetcher: () => getRiskEvents(50),
    intervalMs: POLL_INTERVAL_MS,
  });

  const renderItem = ({ item }: { item: RiskEvent }) => {
    const color = riskColor(item.risk_level);
    return (
      <View className="mx-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <View className="flex-row items-center gap-3 p-4">
          <View
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}1A` }}
          >
            <Ionicons name={riskIcon(item.risk_level)} size={20} color={color} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                {item.zone_id}
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-500">
                {formatTime(item.created_at)}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-xs text-slate-500 dark:text-slate-500">
                {item.reason}
              </Text>
              <Text className="ml-3 text-sm font-bold" style={{ color }}>
                {item.risk_level}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

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
            Live crowd risk from monitored zones.
          </Text>
        </View>
      </View>

      {error && !data ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
            <Ionicons
              name="cloud-offline-outline"
              size={38}
              color={isDark ? "#2a3a55" : "#CBD5E1"}
            />
          </View>
          <Text className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            Connection Issue
          </Text>
          <Text className="mt-1 text-center text-sm leading-relaxed text-slate-500">
            {error}
          </Text>
          <Text className="mt-4 text-xs text-slate-500 dark:text-slate-500">
            Pull to refresh to try again.
          </Text>
        </View>
      ) : null}

      {data && data.length === 0 ? (
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
            Risk events from the backend will appear here as they are detected.
          </Text>
        </View>
      ) : null}

      {data && data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={(item, index) =>
            `${item.created_at}-${item.zone_id}-${index}`
          }
          renderItem={renderItem}
          contentContainerClassName="gap-3 pb-10 pt-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="#FDBA3B"
            />
          }
        />
      ) : null}
    </SafeAreaView>
  );
}

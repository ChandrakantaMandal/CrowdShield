import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useAuthStore } from "@/store/authStore";
import { useThemeStore, type ThemePreference } from "@/store/themeStore";
import { Text } from "@/components/ui/text";
import { GradientButton } from "@/components/gradient-button";
import { useResolvedColorScheme } from "@/lib/use-resolved-color-scheme";

const menuItems = [
  { label: "Emergency Contacts", icon: "call-outline", color: "#34D399" },
  {
    label: "Notification Preferences",
    icon: "notifications-outline",
    color: "#818CF8",
  },
  {
    label: "Privacy & Security",
    icon: "lock-closed-outline",
    color: "#F9A8D4",
  },
  { label: "Help & Support", icon: "help-circle-outline", color: "#FDBA3B" },
] as const;

const themeOptions: {
  value: ThemePreference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "system", label: "System", icon: "phone-portrait-outline" },
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { preference, setPreference } = useThemeStore();
  const scheme = useResolvedColorScheme();
  const isDark = scheme === "dark";

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "Member";
  const lastName = user?.user_metadata?.full_name?.split(" ")[1] ?? "";
  const email = user?.email ?? "";

  async function handleSignOut() {
    await signOut();
    router.replace("/");
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

        <View className="gap-1 p-5">
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            My Profile
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            Manage your account and preferences.
          </Text>
        </View>

        {/* User card */}
        <View className="px-5">
          <LinearGradient
            colors={["#FDBA3B", "#F43F5E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="overflow-hidden rounded-2xl p-[1.5px]"
          >
            <View className="flex-row items-center gap-4 rounded-[14px] bg-white dark:bg-[#0C1220] p-5">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-amber-400/10">
                <Ionicons name="person" size={26} color="#FDBA3B" />
              </View>

              <View className="flex-1 gap-0.5">
                <Text className="text-base font-bold text-slate-900 dark:text-white">
                  {firstName} {lastName}
                </Text>

                <Text className="text-sm text-slate-500 dark:text-slate-400">
                  {email}
                </Text>
              </View>

              <Ionicons name="shield-checkmark" size={22} color="#34D399" />
            </View>
          </LinearGradient>
        </View>

        {/* Appearance */}
        <View className="mt-6 gap-2 px-5">
          <Text className="px-1 text-base font-semibold text-slate-900 dark:text-white">
            Appearance
          </Text>
          <View className="gap-2">
            {themeOptions.map((option) => {
              const selected = preference === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setPreference(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <View
                    className="h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10"
                    style={{
                      backgroundColor: selected
                        ? "#FDBA3B1F"
                        : isDark
                          ? "#1E293B"
                          : "#F1F5F9",
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={selected ? "#FDBA3B" : "#64748B"}
                    />
                  </View>
                  <Text className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {option.label}
                  </Text>
                  <Ionicons
                    name={selected ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={selected ? "#FDBA3B" : "#64748B"}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Menu */}
        <View className="mt-6 gap-2 px-5">
          {menuItems.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => {
                // TODO: navigate to settings screens
              }}
              accessibilityRole="button"
              className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <View
                className="h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${item.color}1A` }}
              >
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#475569" />
            </Pressable>
          ))}
        </View>

        <View className="mt-8 px-5">
          <GradientButton
            title="Update My Profile"
            onPress={() => {
              // TODO: edit profile screen
            }}
          />
        </View>

        <View className="mt-4 px-5">
          <Pressable
            onPress={handleSignOut}
            accessibilityRole="button"
            className="items-center rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="log-out-outline" size={16} color="#FB7185" />
              <Text className="text-sm font-semibold text-rose-400">
                Sign Out
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

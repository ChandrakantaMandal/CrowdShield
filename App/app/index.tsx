import {
  ImageBackground,
  Pressable,
  View,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "../store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";

import LandingBackground from "@/assets/images/landing.webp";

export default function Index() {
  const { user, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/(tabs)/home");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }
  return (
    <ImageBackground
      source={LandingBackground}
      resizeMode="cover"
      className="flex-1"
    >
      <SafeAreaView className="flex-1 justify-end">
        <View className="px-5 pb-8 gap-4">
          <Pressable
            onPress={() => router.push("/(auth)/signin")}
            className="mt-8"
          >
            <LinearGradient
              colors={["#FDBA3B", "#F43F5E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 28,
                padding: 2,
                shadowColor: "#F43F5E",
                shadowOpacity: 0.35,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 10,
              }}
            >
              <View
                style={{
                  height: 64,
                  borderRadius: 26,
                  backgroundColor: "#0C1220",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text className="text-white text-xl font-bold">Sign In</Text>
              </View>
            </LinearGradient>
          </Pressable>
          <Button
            className="h-16 rounded-3xl bg-[#0C1220] mb-2"
            onPress={() => router.push("/(auth)/signup")}
          >
            <Text className="text-white text-xl font-semibold">
              Create Account
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

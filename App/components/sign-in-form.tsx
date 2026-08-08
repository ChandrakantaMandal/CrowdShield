import * as React from "react";
import { Alert, Pressable, View } from "react-native";
import { router } from "expo-router";

import { supabase } from "@/lib/supabase";
import { signInWithGoogle } from "@/services/google";

import { GradientButton } from "@/components/gradient-button";
import { PasswordInput } from "@/components/password-input";
import { SocialConnections } from "@/components/social-connections";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleEmailLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (
          error.message.toLowerCase().includes("not confirmed") ||
          error.message.toLowerCase().includes("email not verified")
        ) {
          router.replace({
            pathname: "/(auth)/verify-email",
            params: { email },
          });
          return;
        }
        throw error;
      }

      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setLoading(true);

      const signedIn = await signInWithGoogle();

      if (signedIn) {
        router.replace("/(tabs)/home");
      }
    } catch (error: any) {
      Alert.alert("Google Sign In", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Label className="text-slate-500 dark:text-slate-400">Email</Label>
        <Input
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          className="h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </View>

      <View className="gap-2">
        <Label className="text-slate-500 dark:text-slate-400">Password</Label>
        <PasswordInput
          placeholder="password"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleEmailLogin}
        />
      </View>

      <GradientButton
        title="Sign In"
        onPress={handleEmailLogin}
        loading={loading}
        className="mt-2"
      />

      <View className="mt-2 mb-2 flex-row items-center justify-center">
        <Text className="text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?
        </Text>

        <Pressable
          onPress={() => router.push("/signup")}
          className="ml-1"
          hitSlop={8}
        >
          <Text className="text-sm font-semibold text-amber-500 underline dark:text-amber-400">
            Sign up
          </Text>
        </Pressable>
      </View>

      <View className="my-2 flex-row items-center">
        <Separator className="flex-1 bg-slate-200 dark:bg-slate-800" />
        <Text className="px-4 text-sm text-slate-500">OR</Text>
        <Separator className="flex-1 bg-slate-200 dark:bg-slate-800" />
      </View>

      <SocialConnections onGooglePress={handleGoogleLogin} />

      <Text className="text-center text-xs leading-relaxed text-slate-500">
        By continuing, you agree to CrowdShield&apos;s Terms of Service and
        Privacy Policy.
      </Text>
    </View>
  );
}

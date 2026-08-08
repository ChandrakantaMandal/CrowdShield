import { router } from "expo-router";
import * as React from "react";
import { Alert, Pressable, TextInput, View } from "react-native";

import { GradientButton } from "@/components/gradient-button";
import { PasswordInput } from "@/components/password-input";
import { SocialConnections } from "@/components/social-connections";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { createUserProfile } from "@/services/userService";

type SignUpFormProps = {
  onGooglePress?: () => void;
};

const inputClassName =
  "h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

export function SignUpForm({ onGooglePress }: SignUpFormProps) {
  const passwordInputRef = React.useRef<TextInput>(null);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      if (!data.session) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: { email },
        });
        return;
      }

      try {
        await createUserProfile("email");
      } catch (profileError: any) {
        console.warn("Failed to create profile:", profileError.message);
      }

      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Label className="text-slate-500 dark:text-slate-400">Name</Label>
        <Input
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
          className={inputClassName}
        />
      </View>

      <View className="gap-2">
        <Label className="text-slate-500 dark:text-slate-400">Email</Label>
        <Input
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={onEmailSubmitEditing}
          className={inputClassName}
        />
      </View>

      <View className="gap-2">
        <Label className="text-slate-500 dark:text-slate-400">Password</Label>
        <PasswordInput
          ref={passwordInputRef}
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={onSubmit}
        />
      </View>

      <GradientButton
        title="Create Account"
        onPress={onSubmit}
        loading={loading}
        className="mt-2"
      />

      <View className="mt-2 mb-2 flex-row items-center justify-center">
        <Text className="text-sm text-slate-500 dark:text-slate-400">
          Already have an account?
        </Text>

        <Pressable
          onPress={() => router.push("/signin")}
          className="ml-1"
          hitSlop={8}
        >
          <Text className="text-sm font-semibold text-amber-500 underline dark:text-amber-400">
            Sign in
          </Text>
        </Pressable>
      </View>

      <View className="my-2 flex-row items-center">
        <Separator className="flex-1 bg-slate-200 dark:bg-slate-800" />
        <Text className="px-4 text-sm text-slate-500">or</Text>
        <Separator className="flex-1 bg-slate-200 dark:bg-slate-800" />
      </View>

      <SocialConnections onGooglePress={onGooglePress} />
    </View>
  );
}

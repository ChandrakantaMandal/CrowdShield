import { router } from "expo-router";
import * as React from "react";
import {
  Alert,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { GradientButton } from "@/components/gradient-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { createUserProfile } from "@/services/userService";

const MAX_CODE_LENGTH = 8;

type VerifyEmailFormProps = {
  email?: string;
};

export function VerifyEmailForm({ email: initialEmail = "" }: VerifyEmailFormProps) {
  const [email, setEmail] = React.useState(initialEmail);
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const codeInputRef = React.useRef<TextInput>(null);

  async function verify(token: string) {
    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });
      if (error) throw error;

      await createUserProfile("email");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Verification Failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!email) {
      Alert.alert("Email Required", "Please enter your email address.");
      return;
    }
    if (code.length < 4) {
      Alert.alert("Invalid Code", "Please enter the complete verification code.");
      return;
    }
    await verify(code);
  }

  async function handleResend() {
    if (!email) {
      Alert.alert("Email Required", "Please enter your email address.");
      return;
    }
    try {
      setResending(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      Alert.alert("Code Sent", "A new verification code has been sent to your email.");
    } catch (error: any) {
      Alert.alert("Resend Failed", error.message);
    } finally {
      setResending(false);
    }
  }

  function handleCodeChange(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, MAX_CODE_LENGTH);
    setCode(digits);
  }

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Label className="text-slate-500 dark:text-slate-400">Email</Label>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          editable={!loading}
          className="h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </View>

      <View className="gap-2">
        <Label className="text-slate-500 dark:text-slate-400">Verification Code</Label>
        <Input
          ref={codeInputRef}
          value={code}
          onChangeText={handleCodeChange}
          placeholder="123456"
          keyboardType="number-pad"
          maxLength={MAX_CODE_LENGTH}
          editable={!loading}
          autoFocus
          className="h-12 border-slate-200 bg-white text-center text-lg tracking-[0.5em] text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-600"
        />
        <Text className="text-xs text-slate-500 dark:text-slate-400">
          Enter the verification code we emailed to you.
        </Text>
      </View>

      <GradientButton
        title="Verify Email"
        onPress={handleSubmit}
        loading={loading}
      />

      <View className="flex-row items-center justify-center gap-1">
        <Text className="text-sm text-slate-500 dark:text-slate-400">Didn&apos;t receive it?</Text>
        <Pressable onPress={handleResend} disabled={resending}>
          <Text className="text-sm font-semibold text-amber-500 dark:text-amber-400">
            {resending ? "Sending..." : "Resend code"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

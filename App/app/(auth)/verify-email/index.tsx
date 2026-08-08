import { useLocalSearchParams } from "expo-router";

import { AuthHeader } from "@/components/auth-header";
import { AuthScreen } from "@/components/auth-screen";
import { VerifyEmailForm } from "@/components/verify-email-form";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email : "";

  return (
    <AuthScreen>
      <AuthHeader
        title="Verify your email"
        subtitle="We sent a 6-digit code to your inbox. Enter it below to activate your account."
      />
      <VerifyEmailForm email={email} />
    </AuthScreen>
  );
}

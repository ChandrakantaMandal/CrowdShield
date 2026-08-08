import { router } from "expo-router";
import { Alert } from "react-native";

import { AuthHeader } from "@/components/auth-header";
import { AuthScreen } from "@/components/auth-screen";
import { SignUpForm } from "@/components/sign-up-form";

import { signInWithGoogle } from "@/services/google";

export default function SignUpScreen() {
  async function handleGoogleLogin() {
    try {
      const signedIn = await signInWithGoogle();

      if (signedIn) {
        router.replace("/(tabs)/home");
      }
    } catch (error: any) {
      Alert.alert("Google Sign In", error.message);
    }
  }

  return (
    <AuthScreen>
      <AuthHeader
        title="Create your account"
        subtitle="Welcome! Fill in your details to get started."
      />
      <SignUpForm onGooglePress={handleGoogleLogin} />
    </AuthScreen>
  );
}

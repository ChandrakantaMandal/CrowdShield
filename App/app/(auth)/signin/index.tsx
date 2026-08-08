import { AuthHeader } from '@/components/auth-header';
import { AuthScreen } from '@/components/auth-screen';
import { SignInForm } from '@/components/sign-in-form';

export default function SignInScreen() {
  return (
    <AuthScreen>
      <AuthHeader
        title="Welcome Back"
        subtitle="Sign in to continue to CrowdShield."
      />
      <SignInForm />
    </AuthScreen>
  );
}

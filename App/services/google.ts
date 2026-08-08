import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase, OAUTH_REDIRECT_URL } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle(): Promise<boolean> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: OAUTH_REDIRECT_URL,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    OAUTH_REDIRECT_URL
  );

  if (result.type !== "success") {
    return false;
  }

  const { queryParams } = Linking.parse(result.url);

  const rawCode = queryParams?.code;
  const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;

  if (!code) {
    throw new Error("No auth code returned from Google.");
  }

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) throw exchangeError;

  return true;
}

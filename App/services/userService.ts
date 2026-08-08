import { supabase } from "@/lib/supabase";

export async function createUserProfile(provider: "email" | "google") {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not found");
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      "",
    email: user.email,
    provider,
    role: "user",
    avatar_url: user.user_metadata?.avatar_url ?? null,
  });

  if (error) {
    throw error;
  }

  return user;
}
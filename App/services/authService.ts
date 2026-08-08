import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

class AuthService {
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  }

  async logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return !!session;
  }

  async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session;
  }
}

export const authService = new AuthService();
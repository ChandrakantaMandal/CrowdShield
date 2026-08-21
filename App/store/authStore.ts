import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  loading: boolean;

  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) =>
    set({
      user,
      loading: false,
    }),

  checkAuth: async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      if (!supabase) {
        set({ user: null, loading: false });
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      set({
        user: session?.user ?? null,
        loading: false,
      });
    } catch (err) {
      console.error("[AuthStore] checkAuth failed:", err);
      set({ user: null, loading: false });
    }
  },

  signOut: async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("[AuthStore] signOut failed:", err);
    } finally {
      set({ user: null, loading: false });
    }
  },
}));

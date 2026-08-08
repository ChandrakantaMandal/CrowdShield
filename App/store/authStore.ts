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
    const { supabase } = await import("@/lib/supabase");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    set({
      user: session?.user ?? null,
      loading: false,
    });
  },

  signOut: async () => {
    const { supabase } = await import("@/lib/supabase");

    await supabase.auth.signOut();

    set({
      user: null,
      loading: false,
    });
  },
}));

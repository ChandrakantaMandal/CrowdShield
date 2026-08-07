import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  profile: null,

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ profile }),

  logout: () =>
    set({
      user: null,
      profile: null,
    }),
}));

export default useAuthStore;
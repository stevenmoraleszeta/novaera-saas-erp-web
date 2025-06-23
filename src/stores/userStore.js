import { create } from "zustand";

const useUserStore = create((set, get) => ({
  user: null,

  setUser: (user) => {
    set({ user });
  },

  clearUser: () => {
    set({ user: null });
  },

  // Initialize user from server response
  initializeUser: (user) => {
    if (user) {
      set({ user });
    }
  },
}));

export default useUserStore;

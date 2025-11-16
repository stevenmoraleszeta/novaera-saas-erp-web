import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set, get) => ({
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

      // Get user roles
      getUserRoles: () => {
        const { user } = get();
        return user?.roles || [];
      },

      // Check if user has a specific role
      hasRole: (roleName) => {
        const { user } = get();
        return user?.roles?.includes(roleName) || false;
      },

      // Check if user has any of the specified roles
      hasAnyRole: (roleNames) => {
        const { user } = get();
        if (!user?.roles) return false;
        return roleNames.some(role => user.roles.includes(role));
      },
    }),
    {
      name: "user-storage", // unique name for localStorage key
      partialize: (state) => ({ user: state.user }), // only persist user data
    }
  )
);

export default useUserStore;

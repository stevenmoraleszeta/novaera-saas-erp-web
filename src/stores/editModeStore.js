import { create } from "zustand";
import { persist } from "zustand/middleware";

const useEditModeStore = create(
  persist(
    (set, get) => ({
      // State
      isEditingMode: false,
      _hasHydrated: false,

      // Actions
      toggleEditMode: () => {
        set((state) => {
          const newMode = !state.isEditingMode;
          
          // También guardar en localStorage como respaldo
          if (typeof window !== 'undefined') {
            localStorage.setItem('edit-mode', JSON.stringify(newMode));
          }
          
          return { isEditingMode: newMode };
        });
      },

      setEditMode: (value) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('edit-mode', JSON.stringify(value));
        }
        set({ isEditingMode: value });
      },

      // Reset edit mode (useful for logout)
      resetEditMode: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('edit-mode');
        }
        set({ isEditingMode: false });
      },

      // Hydration
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      // Manual sync from localStorage
      syncFromLocalStorage: () => {
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('edit-mode');
            if (stored !== null) {
              const isEditing = JSON.parse(stored);
              set({ isEditingMode: isEditing });
              return isEditing;
            }
          } catch (error) {
            console.error("Error syncing from localStorage:", error);
          }
        }
        return false;
      },
    }),
    {
      name: "edit-mode-storage",
      partialize: (state) => ({ isEditingMode: state.isEditingMode }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useEditModeStore;

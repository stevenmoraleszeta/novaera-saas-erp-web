import { create } from "zustand";
import { persist } from "zustand/middleware";

const useEditModeStore = create(
  persist(
    (set, get) => ({
      // State
      isEditingMode: false,

      // Actions
      toggleEditMode: () => {
        set((state) => ({ isEditingMode: !state.isEditingMode }));
      },

      setEditMode: (value) => {
        set({ isEditingMode: value });
      },

      // Reset edit mode (useful for logout)
      resetEditMode: () => {
        set({ isEditingMode: false });
      },
    }),
    {
      name: "edit-mode-storage",
      partialize: (state) => ({ isEditingMode: state.isEditingMode }),
    }
  )
);

export default useEditModeStore;

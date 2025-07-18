import { create } from "zustand";
import { persist } from "zustand/middleware";

// Local storage keys
const TABS_STORAGE_KEY = "erp_module_tabs";
const ACTIVE_TAB_STORAGE_KEY = "erp_active_tab";

// Fixed home tab
const HOME_TAB = {
  id: "home",
  name: "Menú Principal",
  path: "/modules",
  isFixed: true,
  isHome: true,
};

// Helper functions for localStorage
const getStoredTabs = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(TABS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading tabs from localStorage:", error);
    return [];
  }
};

const setStoredTabs = (tabs) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
  } catch (error) {
    console.error("Error writing tabs to localStorage:", error);
  }
};

const getStoredActiveTab = () => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error reading active tab from localStorage:", error);
    return null;
  }
};

const setStoredActiveTab = (activeTab) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, JSON.stringify(activeTab));
  } catch (error) {
    console.error("Error writing active tab to localStorage:", error);
  }
};

// Clean up invalid tabs (e.g., tabs that reference non-existent modules)
const cleanupInvalidTabs = (tabs) => {
  return tabs.filter((tab) => {
    if (tab.id === "home") return false;
    if (tab.isFixed) return true;
    return tab.path && tab.name && tab.path.startsWith("/modulos/");
  });
};
// Check if current pathname is a module page
const isModulePage = (path) => {
  return path.startsWith("/modulos/") && path !== "/modulos";
};

const useTabStore = create(
  persist(
    (set, get) => ({
      // State
      tabs: [HOME_TAB],
      activeTab: "home",
      loadingTab: null,
      isInitialized: false,

      // Actions

      togglePinTab: (tabId) => {
        const { tabs } = get();
        const updatedTabs = tabs.map((tab) =>
          tab.id === tabId ? { ...tab, isFixed: !tab.isFixed } : tab
        );
        set({ tabs: updatedTabs });

        // Persistir tabs sin los fijos (como ya lo haces)
        //const moduleTabs = updatedTabs.filter((tab) => !tab.isFixed);
        //setStoredTabs(updatedTabs);
        setStoredTabs(updatedTabs.filter((tab) => tab.id !== "home"));
      },

      reorderTabs: (newOrderIds) => {
        const { tabs } = get();

        // Separa tabs pineados y no pineados
        const fixedTabs = tabs.filter(tab => tab.isFixed);
        const movableTabs = tabs.filter(tab => !tab.isFixed);

        // Reordena solo los tabs no pineados con base en newOrderIds
        const reorderedMovableTabs = newOrderIds
          .map(id => movableTabs.find(tab => tab.id === id))
          .filter(Boolean);

        // Combina pineados + reordenados
        const newTabsOrder = [...fixedTabs, ...reorderedMovableTabs];

        set({ tabs: newTabsOrder });

        // Guarda en localStorage solo los no pineados
        //setStoredTabs(reorderedMovableTabs);
        setStoredTabs(reorderedMovableTabs.filter((tab) => tab.id !== "home"));

      },

      setLoadingTab: (tabId) => set({ loadingTab: tabId }),

      // Initialize tabs from localStorage
      initializeTabs: () => {
        const storedTabs = getStoredTabs();
        const storedActiveTab = getStoredActiveTab();

        const cleanedTabs = cleanupInvalidTabs(storedTabs);

        // Asegura que HOME_TAB no esté duplicado
        const withoutHome = cleanedTabs.filter((tab) => tab.id !== "home");

        // Agrega HOME_TAB manualmente y al inicio
        const allTabs = [HOME_TAB, ...withoutHome];

        // Define active tab si existe y es válido
        let newActiveTab = "home";
        if (storedActiveTab && allTabs.find((tab) => tab.id === storedActiveTab)) {
          newActiveTab = storedActiveTab;
        }

        set({ tabs: allTabs, activeTab: newActiveTab, isInitialized: true });
      },

      // Set active tab
      setActiveTab: (tabId) => {
        const { tabs } = get();
        const tab = tabs.find((t) => t.id === tabId);
        if (tab) {
          set({ activeTab: tabId });
          setStoredActiveTab(tabId);
        }
      },

      // Navigate to tab (includes router navigation)
      navigateToTab: (tabId, router) => {
        const { tabs } = get();
        const tab = tabs.find((t) => t.id === tabId);
        if (tab && tab.path && router) {
          router.push(tab.path);
        }
        get().setActiveTab(tabId);
      },

      // Add tab for a module
      addModuleTab: (moduleId, moduleName) => {
        const { tabs, setActiveTab, setLoadingTab } = get();
        const path = `/modulos/${moduleId}`;

        // Check if tab already exists for this module
        const existingTab = tabs.find((tab) => tab.path === path);
        if (existingTab) {
          setActiveTab(existingTab.id);
          return existingTab.id;
        }

        const newTab = {
          id: Date.now(),
          name: moduleName,
          path,
          moduleId,
        };

        const newTabs = [...tabs, newTab];
        set({ tabs: newTabs });
        setLoadingTab(newTab.id);
        setActiveTab(newTab.id);

        // Persist to localStorage
        //const moduleTabs = newTabs.filter((tab) => !tab.isFixed);
        //setStoredTabs(newTabs);
        setStoredTabs(newTabs.filter((tab) => tab.id !== "home"));

        return newTab.id;
      },

      // Add generic tab
      addTab: (name, path = null) => {
        const { tabs, setActiveTab, setLoadingTab } = get();

        // Only allow adding module tabs
        if (!path || !isModulePage(path)) {
          console.warn("Tabs can only be added for module pages");
          return null;
        }

        const newTab = {
          id: Date.now(),
          name: name || "Módulo",
          path,
        };

        const newTabs = [...tabs, newTab];
        set({ tabs: newTabs });
        setLoadingTab(newTab.id);
        setActiveTab(newTab.id);

        // Persist to localStorage
        //const moduleTabs = newTabs.filter((tab) => !tab.isFixed);
        setStoredTabs(newTabs);
        setStoredTabs(newTabs.filter((tab) => tab.id !== "home"));

        return newTab.id;
      },

      // Close tab
      closeTab: async (tabId, router) => {
        const { tabs, setActiveTab, setLoadingTab } = get();

        if (tabId === "home") return;

        const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
        const remainingTabs = tabs.filter((tab) => tab.id !== tabId);

        if (!remainingTabs.find((tab) => tab.id === "home")) {
          remainingTabs.unshift(HOME_TAB);
        }

        set({ tabs: remainingTabs });
        setStoredTabs(remainingTabs.filter((tab) => tab.id !== "home"));

        // Si se cerró el tab activo
        if (get().activeTab === tabId) {
          const nextTab =
            remainingTabs[currentIndex - 1] ||
            remainingTabs[currentIndex] ||
            HOME_TAB;

          setLoadingTab(nextTab.id); // mostrar "cargando"
          setActiveTab(nextTab.id);

          if (router && nextTab.path) {
            try {
              await router.push(nextTab.path); // asegurarse de que navega
            } catch (err) {
              console.error("Error navegando al siguiente tab:", err);
            }
          }

          // Limpiar loading después de un pequeño delay (opcional)
          setTimeout(() => set({ loadingTab: null }), 300);
        }
      },



      // Clear all tabs (for logout/login)
      clearTabs: () => {
        set({ tabs: [HOME_TAB], activeTab: "home", loadingTab: null });
        setStoredTabs([]);
        setStoredActiveTab("home");
        console.log("🧹 Tabs cleared - reset to home tab only");
      },

      // Update active tab based on pathname
      updateActiveTabFromPath: (pathname) => {
        const { tabs, isInitialized } = get();
        if (!pathname || !isInitialized) return;

        if (pathname === "/") {
          get().setActiveTab("home");
        } else if (isModulePage(pathname)) {
          const existingTab = tabs.find((tab) => tab.path === pathname);
          if (existingTab) {
            get().setActiveTab(existingTab.id);
          }
        }
      },

      // Sync with localStorage on visibility change
      syncWithLocalStorage: () => {
        const { tabs, activeTab, isInitialized } = get();
        if (!isInitialized) return;

        const storedTabs = getStoredTabs();
        const storedActiveTab = getStoredActiveTab();

        const allTabs = [HOME_TAB, ...cleanupInvalidTabs(storedTabs)];

        if (JSON.stringify(allTabs) !== JSON.stringify(tabs)) {
          set({ tabs: allTabs });
        }

        if (
          storedActiveTab !== activeTab &&
          allTabs.find((tab) => tab.id === storedActiveTab)
        ) {
          get().setActiveTab(storedActiveTab);
        }
      },
    }),
    {
      name: "tab-storage",
      partialize: (state) => ({
        tabs: state.tabs.filter((tab) => tab.id !== "home"),
        activeTab: state.activeTab,
      }),
    }
  )
);

export default useTabStore;

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Local storage keys
const TABS_STORAGE_KEY = "erp_module_tabs";
const ACTIVE_TAB_STORAGE_KEY = "erp_active_tab";

// Fixed home tab
const HOME_TAB = {
  id: "home",
  name: "Menú Principal",
  path: "/",
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
    // Keep tabs that have valid paths and names
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
      isInitialized: false,

      // Initialize tabs from localStorage
      initializeTabs: () => {
        const storedTabs = getStoredTabs();
        const storedActiveTab = getStoredActiveTab();

        // Clean up any invalid tabs and ensure home tab is always first
        const cleanedTabs = cleanupInvalidTabs(storedTabs);
        const allTabs = [HOME_TAB, ...cleanedTabs];

        // Set active tab logic
        let newActiveTab = "home";
        if (
          storedActiveTab &&
          allTabs.find((tab) => tab.id === storedActiveTab)
        ) {
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
        const { tabs, setActiveTab } = get();
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
        setActiveTab(newTab.id);

        // Persist to localStorage
        const moduleTabs = newTabs.filter((tab) => !tab.isFixed);
        setStoredTabs(moduleTabs);

        return newTab.id;
      },

      // Add generic tab
      addTab: (name, path = null) => {
        const { tabs, setActiveTab } = get();

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
        setActiveTab(newTab.id);

        // Persist to localStorage
        const moduleTabs = newTabs.filter((tab) => !tab.isFixed);
        setStoredTabs(moduleTabs);

        return newTab.id;
      },

      // Close tab
      closeTab: (tabId) => {
        const { tabs, setActiveTab } = get();

        // Don't allow closing the home tab
        if (tabId === "home") return;

        const remainingTabs = tabs.filter((tab) => tab.id !== tabId);

        // Always ensure home tab is present
        if (!remainingTabs.find((tab) => tab.id === "home")) {
          remainingTabs.unshift(HOME_TAB);
        }

        set({ tabs: remainingTabs });

        // If closing active tab, activate the next available tab
        if (get().activeTab === tabId) {
          const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
          const nextTab =
            remainingTabs[currentIndex] ||
            remainingTabs[currentIndex - 1] ||
            remainingTabs[0];
          setActiveTab(nextTab.id);
        }

        // Persist to localStorage
        const moduleTabs = remainingTabs.filter((tab) => !tab.isFixed);
        setStoredTabs(moduleTabs);
      },

      // Clear all tabs (for logout/login)
      clearTabs: () => {
        set({ tabs: [HOME_TAB], activeTab: "home" });
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
        tabs: state.tabs.filter((tab) => !tab.isFixed),
        activeTab: state.activeTab,
      }),
    }
  )
);

export default useTabStore;

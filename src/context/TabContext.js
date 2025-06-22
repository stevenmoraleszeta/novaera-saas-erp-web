"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";

const TabContext = createContext();

export function useTabs() {
  return useContext(TabContext);
}

// Local storage keys
const TABS_STORAGE_KEY = "erp_module_tabs";
const ACTIVE_TAB_STORAGE_KEY = "erp_active_tab";

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

// Fixed home tab
const HOME_TAB = {
  id: "home",
  name: "Menú Principal",
  path: "/",
  isFixed: true,
  isHome: true,
};

export function TabProvider({ children }) {
  const pathname = usePathname();
  const [tabs, setTabs] = useState([HOME_TAB]);
  const [activeTab, setActiveTab] = useState("home");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize tabs from localStorage on mount
  useEffect(() => {
    const storedTabs = getStoredTabs();
    const storedActiveTab = getStoredActiveTab();

    // Clean up any invalid tabs and ensure home tab is always first
    const cleanedTabs = cleanupInvalidTabs(storedTabs);
    const allTabs = [HOME_TAB, ...cleanedTabs];

    setTabs(allTabs);

    // Set active tab logic
    if (storedActiveTab && allTabs.find((tab) => tab.id === storedActiveTab)) {
      setActiveTab(storedActiveTab);
    } else if (pathname === "/") {
      setActiveTab("home");
    } else if (allTabs.length > 1) {
      setActiveTab(allTabs[1].id); // First module tab
    } else {
      setActiveTab("home");
    }

    setIsInitialized(true);
  }, []);

  // Persist tabs to localStorage whenever they change (excluding home tab)
  useEffect(() => {
    if (isInitialized) {
      const moduleTabs = tabs.filter((tab) => !tab.isFixed);
      setStoredTabs(moduleTabs);
    }
  }, [tabs, isInitialized]);

  // Persist active tab to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      setStoredActiveTab(activeTab);
    }
  }, [activeTab, isInitialized]);

  // Handle page visibility change (when user switches tabs or minimizes browser)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isInitialized) {
        // Re-sync with localStorage when page becomes visible
        const storedTabs = getStoredTabs();
        const storedActiveTab = getStoredActiveTab();

        const allTabs = [HOME_TAB, ...cleanupInvalidTabs(storedTabs)];

        if (JSON.stringify(allTabs) !== JSON.stringify(tabs)) {
          setTabs(allTabs);
        }

        if (
          storedActiveTab !== activeTab &&
          allTabs.find((tab) => tab.id === storedActiveTab)
        ) {
          setActiveTab(storedActiveTab);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [tabs, activeTab, isInitialized]);

  // Check if current pathname is a module page
  const isModulePage = (path) => {
    return path.startsWith("/modulos/") && path !== "/modulos";
  };

  // Update active tab based on current pathname
  useEffect(() => {
    if (pathname && isInitialized) {
      if (pathname === "/") {
        setActiveTab("home");
      } else if (isModulePage(pathname)) {
        const existingTab = tabs.find((tab) => tab.path === pathname);
        if (existingTab) {
          setActiveTab(existingTab.id);
        }
      }
    }
  }, [pathname, tabs, isInitialized]);

  // Add tab for a module
  const addModuleTab = (moduleId, moduleName) => {
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

    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab.id);
    return newTab.id;
  };

  const addTab = (name, path = null) => {
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
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
    return newTab.id;
  };

  const closeTab = (tabId) => {
    // Don't allow closing the home tab
    if (tabId === "home") return;

    const remainingTabs = tabs.filter((tab) => tab.id !== tabId);

    // Always ensure home tab is present
    if (!remainingTabs.find((tab) => tab.id === "home")) {
      remainingTabs.unshift(HOME_TAB);
    }

    setTabs(remainingTabs);

    if (activeTab === tabId) {
      // If closing active tab, activate the next available tab
      const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
      const nextTab =
        remainingTabs[currentIndex] ||
        remainingTabs[currentIndex - 1] ||
        remainingTabs[0];
      setActiveTab(nextTab.id);
    }
  };

  const navigateToTab = (tabId) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab && tab.path) {
      // Use Next.js router to navigate
      window.location.href = tab.path;
    } else {
      setActiveTab(tabId);
    }
  };

  const value = {
    tabs,
    activeTab,
    setActiveTab: navigateToTab,
    addTab,
    closeTab,
    addModuleTab,
  };

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import useTabStore from "../stores/tabStore";

export default function TabInitializer() {
  const pathname = usePathname();
  const {
    isInitialized,
    initializeTabs,
    updateActiveTabFromPath,
    syncWithLocalStorage,
  } = useTabStore();

  // Initialize tabs on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeTabs();
    }
  }, [isInitialized, initializeTabs]);

  // Update active tab based on current pathname
  useEffect(() => {
    if (isInitialized && pathname) {
      updateActiveTabFromPath(pathname);
    }
  }, [pathname, isInitialized, updateActiveTabFromPath]);

  // Handle page visibility change (when user switches tabs or minimizes browser)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isInitialized) {
        syncWithLocalStorage();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isInitialized, syncWithLocalStorage]);

  // This component doesn't render anything
  return null;
}

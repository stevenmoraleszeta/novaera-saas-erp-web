"use client";

import React, { useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  X,
  Home,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useTabStore from "@/stores/tabStore";
import { useRouter, usePathname } from "next/navigation";

export default function TabBar() {
  const {
    tabs,
    activeTab,
    navigateToTab,
    closeTab,
    loadingTab,
    setLoadingTab,
  } = useTabStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loadingTab) {
      const targetTab = tabs.find((tab) => tab.id === loadingTab);
      if (targetTab && targetTab.path === pathname) {
        setLoadingTab(null);
      }
    }
  }, [pathname, loadingTab, setLoadingTab, tabs]);

  const handleTabClick = (tabId) => {
    const targetTab = tabs.find((tab) => tab.id === tabId);
    // Only set loading if it's a different tab
    if (targetTab && activeTab !== tabId) {
      setLoadingTab(tabId);
    }
    navigateToTab(tabId, router);
  };

  const handleArrowClick = (direction) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex === -1) return;

    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < tabs.length) {
      const newTab = tabs[newIndex];
      handleTabClick(newTab.id);
    }
  };

  // Don't render tab bar if no tabs
  if (!tabs || tabs.length === 0) {
    return null;
  }

  // Get icon for tab based on path and type
  const getTabIcon = (tab) => {
    if (tab.id === loadingTab) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (tab.isHome) return <Home className="w-4 h-4" />;
    if (tab.path && tab.path.startsWith("/modulos/"))
      return <LayoutGrid className="w-4 h-4" />;
    return <LayoutGrid className="w-4 h-4" />;
  };

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  return (
    <div className="flex items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-[60]">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => handleArrowClick(-1)}
          disabled={activeIndex <= 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => handleArrowClick(1)}
          disabled={activeIndex >= tabs.length - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-grow flex items-center overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex items-center px-4 py-2 cursor-pointer border-b-2 min-w-0 flex-shrink-0 ${
              activeTab === tab.id
                ? "border-black bg-white dark:bg-gray-700"
                : "border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
            } ${tab.isFixed ? "bg-gray-100 dark:bg-gray-700" : ""}`}
          >
            <span className="mr-2 flex-shrink-0">{getTabIcon(tab)}</span>
            <span
              className={`text-sm truncate max-w-32 ${
                tab.isFixed ? "font-medium" : ""
              }`}
            >
              {tab.name}
            </span>
            {/* Only show close button for non-fixed tabs */}
            {!tab.isFixed && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 w-5 h-5 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id, router);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTabs } from "@/context/TabContext";

export default function TabBar() {
  const { tabs, activeTab, setActiveTab, closeTab } = useTabs();

  // Don't render tab bar if no tabs
  if (!tabs || tabs.length === 0) {
    return null;
  }

  // Get icon for tab based on path and type
  const getTabIcon = (tab) => {
    if (tab.isHome) return <Home className="w-4 h-4" />;
    if (tab.path && tab.path.startsWith("/modulos/"))
      return <LayoutGrid className="w-4 h-4" />;
    return <LayoutGrid className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-grow flex items-center overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 cursor-pointer border-b-2 min-w-0 flex-shrink-0 ${
              activeTab === tab.id
                ? "border-blue-500 bg-white dark:bg-gray-700"
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
                  closeTab(tab.id);
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

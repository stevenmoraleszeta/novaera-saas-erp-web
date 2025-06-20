"use client";

import React from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTabs } from "@/context/TabContext";

export default function TabBar() {
  const { tabs, activeTab, setActiveTab, addTab, closeTab } = useTabs();

  return (
    <div className="flex items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <Button variant="ghost" size="icon">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex-grow flex items-center overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 cursor-pointer border-b-2 ${
              activeTab === tab.id
                ? "border-blue-500 bg-white dark:bg-gray-700"
                : "border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <span className="mr-2">
              <LayoutGrid className="w-4 h-4" />
            </span>
            <span className="text-sm">{tab.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 w-5 h-5"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
        <Button variant="ghost" size="icon" onClick={() => addTab()}>
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

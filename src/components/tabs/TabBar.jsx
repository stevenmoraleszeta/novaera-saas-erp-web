"use client";

import React, { useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  X,
  Home,
  Loader2,
  Lock,
  Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useTabStore from "@/stores/tabStore";
import { useRouter, usePathname } from "next/navigation";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

import SortableTab from "./SortableTab"; // Ajusta la ruta si es necesario

export default function TabBar() {
  const {
    tabs,
    activeTab,
    navigateToTab,
    closeTab,
    loadingTab,
    setLoadingTab,
    reorderTabs,
    togglePinTab,
  } = useTabStore();
  const router = useRouter();
  const pathname = usePathname();

  // Divide tabs
  const fixedTabs = tabs.filter(tab => tab.isFixed);
  const movableTabs = tabs.filter(tab => !tab.isFixed);


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


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // evita arrastres accidentales
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tabs.findIndex((t) => t.id === active.id);
    const newIndex = tabs.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...tabs];
    const [movedTab] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, movedTab);

    const newOrderIds = reordered.map((tab) => tab.id);
    reorderTabs(newOrderIds); // <- del store
  };



  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  return (
    <div className="flex items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-[5000]">
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
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >
          <SortableContext items={tabs.map((tab) => tab.id)} strategy={horizontalListSortingStrategy}>
            {tabs.map((tab) => (
              <SortableTab
                key={tab.id}
                tab={tab}
                activeTab={activeTab}
                onClick={handleTabClick}
                onClose={() => closeTab(tab.id, router)}
                icon={getTabIcon(tab)}
                onTogglePin={togglePinTab}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

"use client";

import React, { createContext, useState, useContext } from "react";

const TabContext = createContext();

export function useTabs() {
  return useContext(TabContext);
}

export function TabProvider({ children }) {
  const [tabs, setTabs] = useState([{ id: 1, name: "Menú Principal" }]);
  const [activeTab, setActiveTab] = useState(1);

  const addTab = (name) => {
    const newTab = {
      id: Date.now(),
      name: name || `Módulo ${tabs.length + 1}`,
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = (tabId) => {
    setTabs(tabs.filter((tab) => tab.id !== tabId));
    if (activeTab === tabId) {
      const newActiveTab = tabs.find((tab) => tab.id !== tabId);
      setActiveTab(
        newActiveTab ? newActiveTab.id : tabs.length > 1 ? tabs[0].id : null
      );
    }
  };

  const value = {
    tabs,
    activeTab,
    setActiveTab,
    addTab,
    closeTab,
  };

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}

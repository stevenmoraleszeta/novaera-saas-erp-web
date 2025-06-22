"use client";

import React, { createContext, useContext, useState } from "react";

const EditModeContext = createContext();

export function EditModeProvider({ children }) {
  const [isEditingMode, setIsEditingMode] = useState(false);

  const toggleEditMode = () => {
    setIsEditingMode((prev) => !prev);
  };

  const setEditMode = (value) => {
    setIsEditingMode(value);
  };

  const value = {
    isEditingMode,
    toggleEditMode,
    setEditMode,
  };

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error("useEditMode must be used within an EditModeProvider");
  }
  return context;
}

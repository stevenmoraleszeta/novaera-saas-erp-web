"use client";

import React from "react";
import { LayoutGrid, Settings, Bell, User, GripVertical } from "lucide-react";
import { useTabs } from "@/context/TabContext";
import ModuleCard from "./ModuleCard";
import AddModuleCard from "./AddModuleCard";

const modules = [
  { id: 1, name: "Usuarios", icon: <User /> },
  { id: 2, name: "Roles", icon: <Settings /> },
  { id: 3, name: "Permisos", icon: <Bell /> },
  { id: 4, name: "Módulos", icon: <LayoutGrid /> },
  { id: 5, name: "Ejemplo 1", icon: <GripVertical /> },
  { id: 6, name: "Ejemplo 2", icon: <GripVertical /> },
  { id: 7, name: "Ejemplo 3", icon: <GripVertical /> },
];

export default function ModuleGrid() {
  const { addTab } = useTabs();

  return (
    <main className="flex-grow p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onClick={() => addTab(module.name)}
          />
        ))}
        <AddModuleCard onClick={() => addTab()} />
      </div>
    </main>
  );
}

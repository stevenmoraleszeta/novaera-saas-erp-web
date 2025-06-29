"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  GripVertical,
  Users,
  ShoppingCart,
  Settings,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FolderKanban,
  Package,
} from "lucide-react";

// Mapeo de nombres a íconos
const iconMap = {
  Users,
  ShoppingCart,
  Settings,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FolderKanban,
  Package,
};

export default function ModuleCard({ module, onClick, isEditingMode = false }) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(module);
    }
  };

  const LucideIcon = module.iconUrl && iconMap[module.iconUrl];
  const isEmoji =
    module.iconUrl &&
    typeof module.iconUrl === "string" &&
    !iconMap[module.iconUrl];

  return (
    <Card
      onClick={handleCardClick}
      className="aspect-square flex items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl cursor-pointer w-full"
    >
      <CardContent className="p-0 flex items-center justify-center">
        {/* 1. Si hay iconUrl válida, mostrarla */}
        {LucideIcon && !imageError ? (
          <LucideIcon className="w-24 h-24 text-gray-800 dark:text-gray-200" />
        ) : isEmoji ? (
          <span className="text-[6rem] leading-none">{module.iconUrl}</span>
        ) : (
          // 3. Fallback por defecto
          <GripVertical className="w-24 h-24 text-gray-800 dark:text-gray-200" />
        )}
      </CardContent>
    </Card>
  );
}

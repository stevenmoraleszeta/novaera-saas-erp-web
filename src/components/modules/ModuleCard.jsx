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

   const isEmoji = module.iconUrl && module.iconUrl.startsWith('http');

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(module);
    }
  };

  const LucideIcon = module.iconUrl && iconMap[module.iconUrl];
  // const isEmoji =
  //   module.iconUrl &&
  //   typeof module.iconUrl === "string" &&
  //   !iconMap[module.iconUrl];

  let iconToRender;

  if (LucideIcon) {
    iconToRender = <LucideIcon className="w-2/3 h-2/3" />;
  } else if (isEmoji) {
    // Mostramos directamente la imagen del emoji
    iconToRender = <img src={module.iconUrl} alt="ícono del módulo" className="w-24 h-24" />;
  } else {
    iconToRender = <GripVertical className="w-2/3 h-2/3" />;
  }

  return (
    <Card onClick={handleCardClick} className={`aspect-square flex items-center justify-center p-6`}>
      <CardContent className="p-0 flex items-center justify-center">
        {iconToRender}
      </CardContent>
    </Card>
  );
  // return (
  //     <Card
  //       onClick={handleCardClick}
  //       className={`aspect-square flex items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl w-full cursor-pointer
  //         ${isEditingMode ? "cursor-grab hover:bg-[#f0f0f0]" : ""}`}
  //     >
  //     <CardContent className="p-0 flex items-center justify-center">
  //       {/* 1. Si hay iconUrl válida, mostrarla */}
  //       {LucideIcon && !imageError ? (
  //          <LucideIcon className="w-2/3 h-2/3 text-gray-800 dark:text-gray-200" /> //w-24 h-24 Esto lo cambié a que sea por tamaño porcentual (66%) y no fijo
  //       ) : isEmoji ? (
  //         <span className="text-[6rem] leading-none">{module.iconUrl}</span>
  //       ) : (
  //         // 3. Fallback por defecto
  //         <GripVertical className="w-2/3 h-2/3 text-gray-800 dark:text-gray-200" />
  //       )}
  //     </CardContent>
  //   </Card>
  // );
}

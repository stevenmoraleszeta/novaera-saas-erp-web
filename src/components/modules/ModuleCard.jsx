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

  let iconToRender;

  if (LucideIcon) {
    iconToRender = <LucideIcon className="w-2/3 h-2/3" />;
  } else if (isEmoji) {
    iconToRender = <img src={module.iconUrl} alt="ícono del módulo" className="w-30 h-30" />;
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
}
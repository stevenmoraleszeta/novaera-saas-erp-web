"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GripVertical } from "lucide-react";

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

  return (
    <Card
      onClick={handleCardClick}
      className={`aspect-square flex items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 ease-in-out cursor-pointer hover:-translate-y-1.5 w-full ${
        isEditingMode ? "animate-shake" : ""
      }`}
    >
      <CardContent className="p-0">
        {module.iconUrl && !imageError ? (
          <img
            src={module.iconUrl}
            alt={module.name}
            className="w-24 h-24 object-contain"
            onError={handleImageError}
          />
        ) : (
          <GripVertical className="w-24 h-24 text-gray-800 dark:text-gray-200" />
        )}
      </CardContent>
    </Card>
  );
}

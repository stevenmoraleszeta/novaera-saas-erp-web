"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function ModuleCard({ module, onClick }) {
  return (
    <Card
      onClick={onClick}
      className="aspect-square flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out cursor-pointer hover:-translate-y-1"
    >
      <CardContent className="flex flex-col items-center justify-center p-0 text-center">
        {React.cloneElement(module.icon, {
          className: "w-1/2 h-1/2 text-gray-700 dark:text-gray-300 mb-2",
        })}
        <span className="text-sm font-medium">{module.name}</span>
      </CardContent>
    </Card>
  );
}

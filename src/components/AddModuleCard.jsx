"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AddModuleCard({ onClick, isEditingMode = false }) {
  return (
    <Card
      onClick={onClick}
      className={`aspect-square flex items-center justify-center p-6 bg-gray-200 dark:bg-gray-700 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 ease-in-out cursor-pointer hover:-translate-y-1.5 w-full ${
        isEditingMode ? "animate-shake" : ""
      }`}
    >
      <CardContent className="p-0">
        <Plus className="w-24 h-24 text-gray-500 dark:text-gray-400" />
      </CardContent>
    </Card>
  );
}

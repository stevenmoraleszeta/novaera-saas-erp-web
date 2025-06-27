"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AddModuleCard({ onClick, isEditingMode = false }) {
  return (
    <Card
      onClick={onClick}
      className="aspect-square flex items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl cursor-pointer w-full"
    >
      <CardContent className="p-0 flex items-center justify-center">
        <Plus className="w-24 h-24 text-gray-800 dark:text-gray-200" />
      </CardContent>
    </Card>
  );
}

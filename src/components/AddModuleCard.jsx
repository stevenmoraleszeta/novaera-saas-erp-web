"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AddModuleCard({ onClick }) {
  return (
    <Card
      className="aspect-square flex flex-col items-center justify-center p-4 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out cursor-pointer hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center p-0">
        <Plus className="w-1/2 h-1/2 text-gray-500 dark:text-gray-400" />
      </CardContent>
    </Card>
  );
}

"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const DATA_TYPES = [
  { label: "Texto", value: "string" },
  { label: "Número entero", value: "integer" },
  { label: "Número decimal", value: "decimal" },
  { label: "Booleano", value: "boolean" },
  { label: "Fecha", value: "date" },
  { label: "Fecha y hora", value: "datetime" },
  { label: "JSON", value: "json" },
  { label: "Texto largo", value: "text" },
  { label: "UUID", value: "uuid" },
];

export default function ColumnTypeSelector({
  value,
  onChange,
  error,
  label = "Tipo de dato",
  required = false,
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors">
          <SelectValue placeholder="Seleccione un tipo de dato" />
        </SelectTrigger>
        <SelectContent>
          {DATA_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

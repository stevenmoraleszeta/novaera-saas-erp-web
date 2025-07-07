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
  { label: "Texto largo", value: "text" },
  { label: "Número entero", value: "integer" },
  { label: "Número decimal", value: "decimal" },
  { label: "Checkbox", value: "boolean" },
  { label: "Fecha", value: "date" },
  { label: "Fecha y hora", value: "datetime" },
  { label: "Relación Foránea", value: "foreign" },
  { label: "Selección", value: "select" },
  { label: "Archivo", value: "file" },
  { label: "Múltiples archivos", value: "file_array" },
  { label: "Usuario", value: "user" },
  { label: "Usuarios Asignados", value: "assigned_users" },
  { label: "JSON", value: "json" },
  { label: "UUID", value: "uuid" },
];

export default function ColumnTypeSelector({
  value,
  onChange,
  error,
  label = "",
  required = false,
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full h-11 focus:border-black focus:ring-blue-500/20 transition-colors">
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

      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
}

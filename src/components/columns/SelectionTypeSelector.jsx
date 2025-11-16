"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SelectionTypeSelector({
  value = "table",
  onChange,
  disabled = false,
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        Tipo de Selección
      </Label>
      
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona el tipo de selección" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="table">
            <div className="space-y-1">
              <div className="font-medium">Usar registros de otra tabla</div>
              <div className="text-sm text-gray-600">
                Las opciones se obtienen de los registros de una tabla existente
              </div>
            </div>
          </SelectItem>
          <SelectItem value="custom">
            <div className="space-y-1">
              <div className="font-medium">Crear opciones personalizadas</div>
              <div className="text-sm text-gray-600">
                Define tus propias opciones estáticas para esta columna
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import ReusableCombobox from "@/components/ui/reusableCombobox";
import { useColumnOptions } from "@/hooks/useColumnOptions";

export default function SelectionField({
  columnId,
  value,
  onChange,
  required = false,
  disabled = false,
  label,
  placeholder = "Selecciona una opción",
  onRedirectClick,
}) {
  const { options, loading, error } = useColumnOptions(columnId);
  
  // Muestra un estado deshabilitado si no hay columnId
  if (!columnId) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="h-11 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 text-sm flex items-center">
          Configuración de columna incompleta
        </div>
      </div>
    );
  }

  // Prepara el array de opciones, añadiendo la opción para limpiar la selección
  const finalOptions = [
    { label: "-- Ninguno --", value: "clear-selection" },
    ...options.filter(option => option && option.value !== null && option.value !== undefined && option.value !== "")
  ];

  return (
    <div className="space-y-2">
      <ReusableCombobox
        placeholder={loading ? "Cargando opciones..." : (error ? "Error al cargar" : placeholder)}
        options={loading || error ? [] : finalOptions}
        value={value || "clear-selection"}
        onChange={(val) => onChange(val === "clear-selection" ? "" : val)}
        disabled={disabled || loading || !!error}
        onRedirectClick={onRedirectClick}
        error={error} // Pasa el mensaje de error al combobox si tiene esa prop
      />
    </div>
  );
}
"use client";

import React, { useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ForeignKeySelector({
  tables = [],
  columnsByTable = {},
  selectedTableId,
  selectedColumnId,
  onChangeTable,
  onChangeColumn,
  errorTable,
  errorColumn,
  helperTable,
  helperColumn,
  required = false,
}) {
  const tableOptions = tables.map((t) => ({ value: String(t.id), label: t.name }));
  const columnOptions =
    selectedTableId && columnsByTable[selectedTableId]
      ? columnsByTable[selectedTableId].map((c) => ({
          value: c.name,
          label: c.name,
        }))
      : [];

  // Limpiar columna si no hay tabla seleccionada
  useEffect(() => {
    if (!selectedTableId && selectedColumnId !== "") {
      onChangeColumn("");
    }
  }, [selectedTableId, selectedColumnId, onChangeColumn]);

  return (
    <div className="space-y-6">
      {/* Tabla de referencia */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Tabla de referencia {required && <span className="text-red-500">*</span>}
        </Label>

        <Select
          value={selectedTableId?.toString() || ""}
          onValueChange={(val) => onChangeTable(val)}
        >
          <SelectTrigger className="w-full h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors">
            <SelectValue placeholder="Seleccione una tabla" />
          </SelectTrigger>
          <SelectContent>
            {tableOptions.map((table) => (
              <SelectItem key={table.value} value={table.value}>
                {table.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {helperTable && <p className="text-xs text-muted-foreground">{helperTable}</p>}
        {errorTable && <p className="text-sm text-red-500 font-medium">{errorTable}</p>}
      </div>

      {/* Columna de referencia */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Columna de referencia {required && <span className="text-red-500">*</span>}
        </Label>

        <Select
          value={selectedColumnId || ""}
          onValueChange={(val) => onChangeColumn(val)}
          disabled={!selectedTableId}
        >
          <SelectTrigger
            className="w-full h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
            aria-disabled={!selectedTableId}
          >
            <SelectValue
              placeholder={
                selectedTableId
                  ? "Seleccione una columna"
                  : "Seleccione primero una tabla"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {columnOptions.map((col) => (
              <SelectItem key={col.value} value={col.value}>
                {col.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {helperColumn && <p className="text-xs text-muted-foreground">{helperColumn}</p>}
        {errorColumn && <p className="text-sm text-red-500 font-medium">{errorColumn}</p>}
      </div>
    </div>
  );
}

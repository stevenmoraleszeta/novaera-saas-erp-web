"use client";

import React, { useEffect } from "react";

import ReusableCombobox from "@/components/ui/reusableCombobox";

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
  const handleTableSelectionChange = (tableId) => {
    onChangeTable(tableId);
    onChangeColumn("");
  };

  return (
    <div className="space-y-6">
      {/* Tabla de referencia */}
      <div className="space-y-2">
        <ReusableCombobox
          label={`Tabla de referencia ${required ? '*' : ''}`}
          placeholder="Seleccione una tabla"
          options={tableOptions}
          value={selectedTableId}
          onChange={handleTableSelectionChange}
        />
        {helperTable && <p className="text-xs text-muted-foreground">{helperTable}</p>}
        {errorTable && <p className="text-sm text-red-500 font-medium">{errorTable}</p>}
      </div>

      {/* Columna de referencia */}
      <div className="space-y-2">
        <ReusableCombobox
          label={`Columna de referencia ${required ? '*' : ''}`}
          placeholder={selectedTableId ? "Seleccione una columna" : "Seleccione primero una tabla"}
          options={columnOptions}
          value={selectedColumnId}
          onChange={onChangeColumn}
          disabled={!selectedTableId}
        />
        {helperColumn && <p className="text-xs text-muted-foreground">{helperColumn}</p>}
        {errorColumn && <p className="text-sm text-red-500 font-medium">{errorColumn}</p>}
      </div>
    </div>
  );
}

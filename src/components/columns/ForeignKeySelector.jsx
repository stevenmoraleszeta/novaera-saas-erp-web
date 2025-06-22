import React, { useState, useEffect } from 'react';
import SelectInput from '../SelectInput';


export default function ForeignKeySelector({
  tables = [],                // [{ id, name }]
  columnsByTable = {},        // { [tableId]: [{ id, name }] }
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

  // Opciones para tablas
  const tableOptions = tables.map(t => ({ value: t.id, label: t.name }));

  // Opciones para columnas según tabla seleccionada
  const columnOptions = selectedTableId && columnsByTable[selectedTableId]
    ? columnsByTable[selectedTableId].map(c => ({ value: c.name, label: c.name }))
    : [];
    

  // Cuando cambia tabla, limpiar columna seleccionada
        useEffect(() => {
        if (!selectedTableId && selectedColumnId !== '') {
            onChangeColumn('');
        }
        }, [selectedTableId, selectedColumnId, onChangeColumn]);

  return (
    <div>
      <SelectInput
        label="Tabla de referencia"
        name="foreignTable"
        value={selectedTableId || ''}
        onChange={e => onChangeTable(e.target.value)}
        options={tableOptions}
        error={errorTable}
        helper={helperTable}
        placeholder="Seleccione una tabla"
        required={required}
      />

      <SelectInput
        label="Columna de referencia"
        name="foreignColumn"
        value={selectedColumnId || ''}
        onChange={e => onChangeColumn(e.target.value)}
        options={columnOptions}
        error={errorColumn}
        helper={helperColumn}
        placeholder={selectedTableId ? "Seleccione una columna" : "Seleccione primero una tabla"}
        required={required}
        disabled={!selectedTableId}
      />
    </div>
  );
}

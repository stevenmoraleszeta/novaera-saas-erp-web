import React, { useState, useMemo } from 'react';
import SelectInput from '../SelectInput';

const DATA_TYPES = [
  { label: 'Texto', value: 'string' },
  { label: 'Número entero', value: 'integer' },
  { label: 'Número decimal', value: 'decimal' },
  { label: 'Booleano', value: 'boolean' },
  { label: 'Fecha', value: 'date' },
  { label: 'Fecha y hora', value: 'datetime' },
  { label: 'JSON', value: 'json' },
  { label: 'Texto largo', value: 'text' },
  { label: 'UUID', value: 'uuid' },
];

export default function ColumnTypeSelector({ value, onChange, error,  label = 'Tipo de dato', required = false }) {
  const [search, setSearch] = useState('');

  // Filtrar tipos por búsqueda (etiqueta)
  const filteredTypes = useMemo(() => {
    if (!search.trim()) return DATA_TYPES;
    return DATA_TYPES.filter(type =>
      type.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>

        <SelectInput
            label="Tipo de dato"
            name="dataType"
            value={value}
            onChange={e => onChange(e.target.value)}
            options={DATA_TYPES}
            error={error}
            placeholder="Seleccione un tipo de dato"
            required={required}
            />

    </div>
  );
}

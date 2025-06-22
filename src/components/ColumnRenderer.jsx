import React from 'react';

// Renderiza el valor de una columna según su tipo
export default function ColumnRenderer({ value, column }) {
  switch (column.data_type) {
    case 'boolean':
      return <span>{value ? 'Sí' : 'No'}</span>;
    case 'date':
      return <span>{value ? new Date(value).toLocaleDateString() : ''}</span>;
    case 'number':
      return <span>{value}</span>;
    default:
      return <span>{value}</span>;
  }
}

import React from 'react';

export default function TableFilterBar({ columns, onFilter }) {
  // Simple filter bar: one input per column
  const handleChange = (e, col) => {
    onFilter(f => ({ ...f, [col.name]: e.target.value }));
  };
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      {columns.map(col => (
        <input
          key={col.id}
          placeholder={`Filtrar ${col.name}`}
          onChange={e => handleChange(e, col)}
          style={{ padding: 6, borderRadius: 4, border: '1px solid #e5e7eb', minWidth: 100 }}
        />
      ))}
    </div>
  );
}

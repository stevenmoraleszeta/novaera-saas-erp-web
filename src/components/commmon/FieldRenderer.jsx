import React from 'react';

export default function FieldRenderer({ column, value, onChange, error }) {
  // Render input based on column type
  switch (column.data_type) {
    case 'boolean':
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => onChange({ target: { value: e.target.checked } })}
          />
          {column.name}
        </label>
      );
    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={onChange}
          style={{ width: '100%' }}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={onChange}
          style={{ width: '100%' }}
        />
      );
    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={onChange}
          style={{ width: '100%' }}
        />
      );
  }
}

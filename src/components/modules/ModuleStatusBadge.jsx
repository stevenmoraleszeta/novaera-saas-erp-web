"use client";

import React from 'react';

export default function ModuleStatusBadge({ active }) {
  return (
    <span style={{
      padding: '2px 10px',
      borderRadius: 12,
      background: active ? '#7ed957' : '#ccc',
      color: active ? '#232526' : '#666',
      fontWeight: 600,
      fontSize: 13
    }}>
      {active ? 'Activo' : 'Eliminado'}
    </span>
  );
}

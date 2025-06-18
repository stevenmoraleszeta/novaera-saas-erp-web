"use client";
import React from 'react';

// permissions: [{ module: 'Usuarios', actions: [{ id: 'read_users', label: 'Ver usuarios' }, ...] }]
export default function PermissionSelector({ value = [], onChange, permissions = [] }) {
  const handleToggle = (permId) => {
    if (value.includes(permId)) {
      onChange(value.filter((id) => id !== permId));
    } else {
      onChange([...value, permId]);
    }
  };

  return (
    <div style={{ margin: '1em 0' }}>
      <label style={{ fontWeight: 600 }}>Permisos:</label>
      {permissions.length === 0 && <div style={{ color: '#888', fontSize: 13 }}>No hay permisos disponibles.</div>}
      {permissions.map((group) => (
        <div key={group.module} style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{group.module}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {group.actions.map((perm) => (
              <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="checkbox"
                  checked={value.includes(perm.id)}
                  onChange={() => handleToggle(perm.id)}
                />
                {perm.label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

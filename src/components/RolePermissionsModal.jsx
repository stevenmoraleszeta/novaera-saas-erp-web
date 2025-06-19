import React, { useEffect, useState } from 'react';
import RolePermissionsView from './RolePermissionsView';
import { getTables } from '../services/tablesService';

export default function RolePermissionsModal({ permissions, onClose }) {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    getTables().then(setTables);
  }, []);

  return (
    <div style={{ padding: '2em', minWidth: 350 }}>
      <h2 style={{ marginBottom: 16 }}>Permisos asignados</h2>
      <RolePermissionsView permissions={permissions} tables={tables} />
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <button onClick={onClose} style={{ padding: '0.5em 1.5em', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Cerrar</button>
      </div>
    </div>
  );
}

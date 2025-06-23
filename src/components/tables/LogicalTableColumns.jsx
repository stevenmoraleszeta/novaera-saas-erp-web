import React, { useEffect, useState } from 'react';
import { getLogicalTableStructure } from '@/services/logicalTableService';

export default function LogicalTableColumns({ tableId, refreshKey }) {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tableId) return;
    let isMounted = true;

    const fetchColumns = async () => {
      setLoading(true);
      try {
        const cols = await getLogicalTableStructure(tableId);
        if (isMounted) setColumns(cols);
      } catch {
        if (isMounted) setColumns([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchColumns();

    return () => {
      isMounted = false;
    };
  }, [tableId, refreshKey]);

  if (loading) return <div>Cargando columnas...</div>;
  if (!columns.length) return <div>No hay columnas definidas.</div>;

  const headerStyle = {
    borderBottom: '1px solid #e5e7eb',
    padding: 8,
    background: '#0284fe',
    color: '#fff',
    textAlign: 'left',
  };

  const cellStyle = {
    padding: 8,
    borderBottom: '1px solid #f3f4f6',
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
      <thead>
        <tr>
          <th style={headerStyle}>Nombre</th>
          <th style={headerStyle}>Tipo</th>
          <th style={headerStyle}>Obligatorio</th>
          <th style={headerStyle}>Foránea</th>
        </tr>
      </thead>
      <tbody>
        {columns.map(({ id, name, data_type, is_required, is_foreign_key }) => (
          <tr key={id}>
            <td style={cellStyle}>{name}</td>
            <td style={cellStyle}>{data_type}</td>
            <td style={cellStyle}>{is_required ? 'Sí' : 'No'}</td>
            <td style={cellStyle}>{is_foreign_key ? 'Sí' : 'No'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import React, { useEffect, useState } from 'react';
import { getLogicalTableStructure } from '@/services/logicalTableService';

export default function LogicalTableColumns({ tableId, refreshKey }) {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColumns = async () => {
      setLoading(true);
      try {
        const cols = await getLogicalTableStructure(tableId);
        setColumns(cols);
      } catch (err) {
        setColumns([]);
      } finally {
        setLoading(false);
      }
    };
    if (tableId) fetchColumns();
  }, [tableId, refreshKey]);

  if (loading) return <div>Cargando columnas...</div>;
  if (!columns.length) return <div>No hay columnas definidas.</div>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
      <thead>
        <tr>
          <th style={{ borderBottom: '1px solid #e5e7eb', padding: 8, background: '#0284fe', color: '#fff' }}>Nombre</th>
          <th style={{ borderBottom: '1px solid #e5e7eb', padding: 8, background: '#0284fe', color: '#fff' }}>Tipo</th>
          <th style={{ borderBottom: '1px solid #e5e7eb', padding: 8, background: '#0284fe', color: '#fff' }}>Obligatorio</th>
          <th style={{ borderBottom: '1px solid #e5e7eb', padding: 8, background: '#0284fe', color: '#fff' }}>Foránea</th>
        </tr>
      </thead>
      <tbody>
        {columns.map(col => (
          <tr key={col.id}>
            <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{col.name}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{col.data_type}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{col.is_required ? 'Sí' : 'No'}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{col.is_foreign_key ? 'Sí' : 'No'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

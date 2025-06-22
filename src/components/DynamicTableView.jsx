import React, { useEffect, useState } from 'react';
import { getLogicalTableStructure, getLogicalTableRecords, updateLogicalTableRecord } from '@/services/logicalTableService';
import ColumnRenderer from './ColumnRenderer';
import TableFilterBar from './TableFilterBar';
import TablePagination from './TablePagination';
import FieldRenderer from './FieldRenderer';

export default function DynamicTableView({ tableId, refresh, isEditingMode, editingRecordId, setEditingRecordId, onDeleteRecord, onRecordSaved, hideEditDeleteButtons, onEditRecord }) {
  const [columns, setColumns] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});
  const [editFields, setEditFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cols = await getLogicalTableStructure(tableId);
        setColumns(cols);
        const data = await getLogicalTableRecords(tableId, { page, pageSize, ...filters });
        setRecords(data.records || data); // soporta ambos formatos
        setTotal(data.total || (data.records ? data.records.length : data.length));
      } catch (err) {
        setRecords([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    if (tableId) fetchData();
  }, [tableId, page, pageSize, filters, refresh]);

  useEffect(() => {
    if (editingRecordId) {
      const rec = records.find(r => r.id === editingRecordId);
      setEditFields(rec ? { ...rec.record_data } : {});
      setSaveError(null);
    } else {
      setEditFields({});
      setSaveError(null);
    }
  }, [editingRecordId, records]);

  const handleFieldChange = (col, value) => {
    setEditFields(prev => ({ ...prev, [col]: value }));
  };

  const handleSave = async (record) => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateLogicalTableRecord(record.id, {
        table_id: tableId,
        record_data: editFields,
      });
      setEditingRecordId(null);
      if (onRecordSaved) onRecordSaved();
    } catch (err) {
      setSaveError('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando registros...</div>;
  if (!columns.length) return <div>No hay columnas definidas.</div>;

  return (
    <div>
      <TableFilterBar columns={columns} onFilter={setFilters} />
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.id} style={{ borderBottom: '1px solid #e5e7eb', padding: 8 }}>{col.name}</th>
            ))}
            {isEditingMode && (
              <th style={{ borderBottom: '1px solid #e5e7eb', padding: 8 }}>Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {records.map((rec, idx) => {
            const isEditing = isEditingMode && editingRecordId === rec.id;
            return (
              <tr key={rec.id || idx}>
                {columns.map(col => (
                  <td key={col.id} style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>
                    {isEditing ? (
                      <FieldRenderer
                        column={col}
                        value={editFields[col.name]}
                        onChange={e => handleFieldChange(col.name, e.target.value ?? (e.target.checked ?? ''))}
                      />
                    ) : (
                      <ColumnRenderer value={rec.record_data ? rec.record_data[col.name] : rec[col.name]} column={col} />
                    )}
                  </td>
                ))}
                {isEditingMode && (
                  <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                    {!isEditing && (
                      <>
                        <button
                          title="Editar"
                          onClick={() => onEditRecord ? onEditRecord(rec) : setEditingRecordId && setEditingRecordId(rec.id)}
                          style={{
                            marginRight: 8,
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '4px 12px',
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                        >
                          Editar
                        </button>
                        <button
                          title="Eliminar"
                          onClick={() => onDeleteRecord && onDeleteRecord(rec)}
                          style={{
                            background: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '4px 12px',
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                    {isEditing && (
                      <>
                        <button onClick={() => handleSave(rec)} disabled={saving} style={{ marginRight: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 500 }}>
                          {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button onClick={() => setEditingRecordId(null)} disabled={saving} style={{ background: '#e5e7eb', color: '#222', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 500 }}>
                          Cancelar
                        </button>
                        {saveError && <div style={{ color: 'red', marginTop: 4 }}>{saveError}</div>}
                      </>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
    </div>
  );
}

// app/modules/[id]/page.jsx (o .tsx si usas TypeScript)

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getModuleById } from '@/services/moduleService'; 
import Loader from '@/components/Loader'; 
import StatusBadge from '@/components/ModuleStatusBadge';
import { useModules } from '@/hooks/useModules';
import Table from '@/components/Table';
import MainContent from '@/components/MainContent';
import LogicalTableList from '@/components/LogicalTableList';
import EditToggleButton from '@/components/EditToggleButton';
import Modal from '@/components/Modal';
import axios from '@/lib/axios';
import { useLogicalTables } from '@/hooks/useLogicalTables';
import LogicalTableForm from '@/components/LogicalTableForm';
import DeleteLogicalTableButton from '@/components/DeleteLogicalTableButton';

export default function ModuleDetailPage() {

  const {
    modules,
    getById,
  } = useModules();

  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  // Estado para edición inline y autosave
  const [editFields, setEditFields] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Estado para formulario de nueva tabla
  const [newTableFields, setNewTableFields] = useState({ name: '', alias: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const { getAllTables, getTableById, createOrUpdateTable, deleteTable } = useLogicalTables(id);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const data = await getById(id);
        setModule(data);
      } catch (error) {
        console.error('Error fetching module:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [id]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await getAllTables();
        setTables(data);
      } catch (err) {
        console.error('Error al obtener tablas lógicas:', err);
      }
    };
    if (id) fetchTables();
  }, [id, getAllTables]);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Validación mínima para el formulario
  const validateTable = (values) => {
    const errors = {};
    if (!values.name) errors.name = 'El nombre es requerido';
    if (!values.id && tables.some(t => t.name === values.name)) errors.name = 'El nombre ya existe';
    return errors;
  };

  // Crear o editar tabla lógica
  const handleSubmitTable = async (values) => {
    setFormLoading(true);
    setFormError(null);
    try {
      let data;
      if (!values.id) {
        // CREAR: 
        data = await createOrUpdateTable({
          name: values.name,
          description: values.description,
          module_id: Number(id)
        });
      } else {
        // EDITAR:
        data = await createOrUpdateTable({
          id: values.id,
          name: values.name,
          description: values.description
        });
      }
      setTables(prev => {
        const idx = prev.findIndex(t => t.id === data.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = data;
          return updated;
        }
        return [...prev, data];
      });
      setShowTableModal(false);
      setSelectedTable(data);
      // Refrescar la lista de tablas después de agregar
      try {
        const refreshed = await getAllTables();
        setTables(refreshed);
      } catch (refreshErr) {
        // Si falla, al menos la tabla nueva queda en la lista
      }
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Error al guardar');
    } finally {
      setFormLoading(false);
    }
  };

  // Eliminar tabla lógica
  const handleDeleteTable = async (table) => {
    try {
      await deleteTable(table.id);
      setTables(prev => prev.filter(t => t.id !== table.id));
      if (selectedTable?.id === table.id) setSelectedTable(null);
    } catch (err) {
      alert(err?.response?.data?.message || 'No se pudo eliminar la tabla. Puede tener dependencias.');
    }
  };
  useEffect(() => {
    if (selectedTable) {
      setEditFields({ name: selectedTable.name, alias: selectedTable.alias || '' });
      setIsDirty(false);
      setSaveError(null);
    }
  }, [selectedTable]);

  // Handlers para acciones
  const handleAddTable = () => { setSelectedTable(null); setShowTableModal(true); };
  const handleEditTable = (table) => { setSelectedTable(table); setShowTableModal(true); };
  const handleViewTable = (table) => { setSelectedTable(table); };

  // Handler para edición inline
  const handleFieldChange = (field, value) => {
    setEditFields(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Limpiar formulario al abrir modal de nueva tabla
  useEffect(() => {
    if (showTableModal && !selectedTable) {
      setNewTableFields({ name: '', alias: '' });
      setCreateError(null);
    }
  }, [showTableModal, selectedTable]);

  if (loading) return <Loader text="Cargando módulo..." />;
  if (!module) return <p>No se encontró el módulo con ID {id}.</p>;

  return (
    <MainContent>
      <div className="module-detail-page-split">
        {/* Sidebar de tablas lógicas */}
        <aside className="logical-tables-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Tablas lógicas</h2>
            <EditToggleButton onToggle={setIsEditingMode} />
          </div>
          <ul className="logical-tables-list">
            {tables.map((table, idx) => (
              <li
                key={table.id ?? `table-idx-${idx}`}
                className={`logical-table-item${selectedTable && selectedTable.id === table.id ? ' selected' : ''}`}
                onClick={() => handleViewTable(table)}
                style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 6, background: selectedTable && selectedTable.id === table.id ? '#f3f4f6' : 'transparent', marginBottom: 4 }}
              >
                <span>{table.name}</span>
              </li>
            ))}
          </ul>
          {isEditingMode && (
            <button onClick={handleAddTable} style={{ width: '100%', marginTop: 12 }}>+ Nueva tabla</button>
          )}
        </aside>

        <section className="logical-table-detail">
          {selectedTable ? (
            <div>
              {isEditingMode ? (
                <>
                  <h3 style={{ marginTop: 0 }}>
                    <input
                      type="text"
                      value={editFields.name ?? selectedTable.name ?? ''}
                      onChange={e => handleFieldChange('name', e.target.value)}
                      style={{ fontSize: '1.2rem', fontWeight: 500, width: '100%' }}
                    />
                  </h3>
                  <p>
                    <strong>Descripción:</strong>{' '}
                    <input
                      type="text"
                      value={editFields.description ?? selectedTable.description ?? ''}
                      onChange={e => handleFieldChange('description', e.target.value)}
                      style={{ fontSize: '1rem', width: 300 }}
                    />
                  </p>
                  <p><strong>Cantidad de columnas:</strong> {selectedTable.columnCount ?? 'N/A'}</p>
                  <div style={{ marginTop: 16, color: '#888' }}>
                    <em>Aquí se mostrarán las columnas de la tabla seleccionada.</em>
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                    <button
                      onClick={async () => {
                        setSaving(true);
                        setSaveError(null);
                        try {
                          const updated = { id: selectedTable.id, name: editFields.name ?? selectedTable.name, description: editFields.description ?? selectedTable.description };
                          const data = await createOrUpdateTable(updated);
                          setTables(prev => prev.map(t => t.id === data.id ? data : t));
                          setSelectedTable(data);
                          setIsDirty(false);
                          try {
                            const refreshed = await getAllTables();
                            setTables(refreshed);
                          } catch (refreshErr) {
                          }
                        } catch (err) {
                          setSaveError('Error al guardar cambios');
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving || !isDirty}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 16, cursor: saving || !isDirty ? 'not-allowed' : 'pointer' }}
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <DeleteLogicalTableButton onDelete={() => handleDeleteTable(selectedTable)} />
                  </div>
                  {saveError && <div style={{ color: 'red', marginTop: 8 }}>{saveError}</div>}
                </>
              ) : (
                <>
                  <h3 style={{ marginTop: 0 }}>{selectedTable.name}</h3>
                  <p><strong>Descripción:</strong> {selectedTable.description || 'Sin descripción'}</p>
                  <p><strong>Cantidad de columnas:</strong> {selectedTable.columnCount ?? 'N/A'}</p>
                  <div style={{ marginTop: 16, color: '#888' }}>
                    <em>Aquí se mostrarán las columnas de la tabla seleccionada.</em>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ color: '#888', marginTop: 32 }}>
              <em>Selecciona una tabla lógica para ver sus detalles.</em>
            </div>
          )}
        </section>

        {/* Modal para crear tabla lógica */}
        <Modal isOpen={showTableModal} onClose={() => setShowTableModal(false)}>
          <div style={{ minWidth: 340, padding: 12 }}>
            <LogicalTableForm
              initialValues={{ name: '', alias: '', description: '' }}
              onSubmit={handleSubmitTable}
              mode="create"
              validate={validateTable}
              loading={formLoading}
              error={formError}
              inputStyle={{ marginBottom: 16, padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', width: '100%' }}
            />
          </div>
        </Modal>
      </div>
      <style jsx>{`
        .module-detail-page-split {
          display: flex;
          gap: 2rem;
          max-width: 100%;
          margin: 2rem auto;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          min-height: 480px;
        }
        .logical-tables-sidebar {
          width: 260px;
          min-width: 200px;
          border-right: 1px solid #e5e7eb;
          padding-right: 1rem;
        }
        .logical-tables-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .logical-table-item.selected {
          background: #f3f4f6;
          font-weight: 500;
        }
        .logical-table-detail {
          flex: 1;
          padding-left: 2rem;
        }
        @media (max-width: 900px) {
          .module-detail-page-split {
            flex-direction: column;
            gap: 1rem;
          }
          .logical-tables-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
            padding-right: 0;
            padding-bottom: 1rem;
          }
          .logical-table-detail {
            padding-left: 0;
          }
        }
      `}</style>
    </MainContent>
  );
}

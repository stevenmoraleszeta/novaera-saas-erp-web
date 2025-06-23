// app/modules/[id]/page.jsx (o .tsx si usas TypeScript)

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Loader from '@/components/ui/Loader'; 
import { useModules } from '@/hooks/useModules';
import MainContent from '@/components/MainContent';
import LogicalTableList from '@/components/tables/LogicalTableList';
import Modal from '@/components/commmon/Modal';
import { useLogicalTables } from '@/hooks/useLogicalTables';
import LogicalTableForm from '@/components/tables/LogicalTableForm';
import DeleteLogicalTableButton from '@/components/tables/DeleteLogicalTableButton';
import DynamicTableView from '@/components/tables/DynamicTableView';
import DynamicRecordForm from '@/components/records/DynamicRecordForm';
import LogicalTableColumns from '@/components/tables/LogicalTableColumns';
import DynamicEditRecordForm from '@/components/records/DynamicEditRecordForm';
import EditToggleButton from '@/components/commmon/EditToggleButton';
import ColumnManager from '@/components/columns/ColumnManager'

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
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [refreshRecords, setRefreshRecords] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Estado para edición inline y autosave
  const [editFields, setEditFields] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Estado para formulario de nueva tabla
  const [newTableFields, setNewTableFields] = useState({ name: '', alias: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Estado para edición inline de registros
  const [isRecordEditingMode, setIsRecordEditingMode] = useState(false);

  // Estado para edición global (tabla y registros)
  const [isGlobalEditingMode, setIsGlobalEditingMode] = useState(false);

  // Track last selected table id to only reset editFields when table changes
  const lastTableIdRef = useRef(null);

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
  


  // Handlers para acciones
  const handleAddTable = () => { setSelectedTable(null); setShowTableModal(true); };
  const handleEditTable = (table) => { setSelectedTable(table); setShowTableModal(true); };
  const handleViewTable = (table) => {
    setSelectedTable(table);
    setEditFields({
      name: table.name ?? '',
      description: table.description ?? ''
    });
    setIsDirty(false);
    setSaveError(null);
  };


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
            <EditToggleButton onToggle={setIsGlobalEditingMode} />
          </div>
          <LogicalTableList
            tables={tables}
            selectedTable={selectedTable}
            onSelect={handleViewTable}
            editing={isGlobalEditingMode}
            onEdit={handleEditTable}
            onDelete={handleDeleteTable}
          />
        </aside>

        <section className="logical-table-detail">
          {selectedTable ? (
            
            <div>
              {isGlobalEditingMode ? (
                <>
                  <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="text"
                      value={editFields.name !== undefined ? editFields.name : selectedTable.name}
                      onChange={e => handleFieldChange('name', e.target.value)}
                    />
                  </h3>
                  <p>
                    <strong>Descripción:</strong>{' '}
                    <input
                      type="text"
                      value={editFields.description !== undefined ? editFields.description : selectedTable.description}
                      onChange={e => handleFieldChange('description', e.target.value)}
                    />
                  </p>
                  <p><strong>Cantidad de columnas:</strong> {selectedTable.columnCount ?? 'N/A'}</p>
                  <div style={{ marginTop: 16 }}>
                    <LogicalTableColumns tableId={selectedTable.id} />
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                    <button
                      onClick={async () => {
                        setSaving(true);
                        setSaveError(null);
                        try {
                          const updated = {
                            id: selectedTable.id,
                            name: editFields.name,
                            description: editFields.description
                          };

                          const data = await createOrUpdateTable(updated);

                          const newSelected = {
                            ...selectedTable,
                            ...data
                          };
                          setSelectedTable(prev => ({
                            ...prev,
                            ...editFields 
                          }));
                          setEditFields({});

                          setIsDirty(false);

                          const refreshed = await getAllTables();
                          setTables(refreshed);
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
                    <button
                      onClick={() => {
                        setEditFields({
                          name: typeof selectedTable.name === 'string' ? selectedTable.name : '',
                          description: typeof selectedTable.description === 'string' ? selectedTable.description : ''
                        });
                        setIsDirty(false);
                        setSaveError(null);
                      }}
                      style={{ background: '#e5e7eb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 16 }}
                    >
                      Cancelar
                    </button>
                    <DeleteLogicalTableButton onDelete={() => handleDeleteTable(selectedTable)} />
                  </div>
                  {saveError && <div style={{ color: 'red', marginTop: 8 }}>{saveError}</div>}
                  <div style={{ marginTop: 32 }}>
                    <DynamicTableView
                      tableId={selectedTable.id}
                      refresh={refreshRecords}
                      isEditingMode={true}
                      editingRecordId={editRecord?.id || null}
                      setEditingRecordId={id => setEditRecord(id ? { id } : null)}
                      onDeleteRecord={rec => setDeleteRecord(rec)}
                      onRecordSaved={() => setRefreshRecords(r => !r)}
                      hideEditDeleteButtons={true}
                      onEditRecord={rec => setEditRecord(rec)}
                    />
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setShowRecordForm(true)}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 16 }}
                    >
                      + Nuevo registro
                    </button>
                  </div>

                  <ColumnManager tableId={selectedTable.id} tableName={selectedTable.name} />
                  <Modal isOpen={showRecordForm} onClose={() => setShowRecordForm(false)}>
                    <div style={{ minWidth: 340, padding: 12 }}>
                      <DynamicRecordForm
                        tableId={selectedTable.id}
                        onSubmitSuccess={() => {
                          setShowRecordForm(false);
                          setRefreshRecords(r => !r);
                        }}
                      />
                    </div>
                  </Modal>
                </>
              ) : (
                // ...vista solo lectura...
                <>
                  <h3 style={{ marginTop: 0 }}>{selectedTable.name}</h3>
                  <p><strong>Descripción:</strong> {selectedTable.description || 'Sin descripción'}</p>
                  <p><strong>Cantidad de columnas:</strong> {selectedTable.columnCount ?? 'N/A'}</p>
                  <div style={{ marginTop: 16 }}>
                    <LogicalTableColumns tableId={selectedTable.id} />
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      onClick={() => setShowRecordForm(true)}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 16 }}
                    >
                      + Nuevo registro
                    </button>
                  </div>
                  <DynamicTableView
                    tableId={selectedTable.id}
                    refresh={refreshRecords}
                    isEditingMode={isGlobalEditingMode}
                    editingRecordId={editRecord?.id || null}
                    setEditingRecordId={id => setEditRecord(id ? { id } : null)}
                    onDeleteRecord={rec => setDeleteRecord(rec)}
                    onRecordSaved={() => setRefreshRecords(r => !r)}
                    hideEditDeleteButtons={true}
                    onEditRecord={rec => setEditRecord(rec)}
                  />
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

        {/* Modal edición registro */}
        <Modal isOpen={!!editRecord} onClose={() => setEditRecord(null)}>
          <div style={{ minWidth: 340, padding: 12 }}>
            {editRecord && (
              <DynamicEditRecordForm
                tableId={selectedTable?.id}
                record={editRecord}
                onSubmitSuccess={() => {
                  setEditRecord(null);
                  setRefreshRecords(r => !r);
                }}
                onCancel={() => setEditRecord(null)}
              />
            )}
          </div>
        </Modal>

        {/* Modal eliminación registro */}
        <Modal isOpen={!!deleteRecord} onClose={() => setDeleteRecord(null)}>
          <div style={{ minWidth: 340, padding: 24, textAlign: 'center' }}>
            <p>¿Seguro que deseas eliminar este registro?</p>
            {deleteError && <div style={{ color: 'red', marginBottom: 8 }}>{deleteError}</div>}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
              <button
                onClick={async () => {
                  setDeleteLoading(true);
                  setDeleteError(null);
                  try {
                    await import('@/services/logicalTableService').then(m => m.deleteLogicalTableRecord(deleteRecord.id));
                    setDeleteRecord(null);
                    setRefreshRecords(r => !r);
                  } catch (err) {
                    setDeleteError('No se pudo eliminar el registro');
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
                disabled={deleteLoading}
                style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 16 }}
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
              <button
                onClick={() => setDeleteRecord(null)}
                style={{ background: '#e5e7eb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 16 }}
              >
                Cancelar
              </button>
            </div>
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

import React, { useEffect, useState } from 'react';
import { useColumns } from '@/hooks/useColumns';
import ColumnListTable from './ColumnListTable';
import ColumnForm from './ColumnForm';
import TablePreview from './TablePreview';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

export default function ColumnManager({ tableId, tableName }) {
  const {
    columns,
    loading,
    error,
    fetchColumns,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleUpdatePosition,
  } = useColumns(tableId);

  const [selectedColumn, setSelectedColumn] = useState(null);
  const [formMode, setFormMode] = useState('create');
  const [formOpen, setFormOpen] = useState(false);

  const [columnToDelete, setColumnToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (tableId) fetchColumns();
  }, [tableId, fetchColumns]);

  const handleDeleteClick = (column) => {
    setColumnToDelete(column);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await handleDelete(columnToDelete);
      setShowDeleteDialog(false);
      setColumnToDelete(null);
      setFormOpen(false); // cerrar el modal si se estaba editando
    } catch (err) {
      console.error('Error al eliminar la columna:', err);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setColumnToDelete(null);
  };

  const handleFormSubmit = async (formData) => {
    if (formMode === 'create') {
      await handleCreate(formData);
    } else if (formMode === 'edit' && selectedColumn) {
      await handleUpdate(selectedColumn.id, formData);
    }
    setFormOpen(false);
    setSelectedColumn(null);
    setFormMode('create');
    fetchColumns();
  };

  const handleFormCancel = () => {
    setFormOpen(false);
    setSelectedColumn(null);
    setFormMode('create');
  };

  const handleCreateCol = () => {
    setSelectedColumn(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEdit = (column) => {
    setSelectedColumn(column);
    setFormMode('edit');
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Gestor de Columnas</h2>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <ColumnListTable
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onAdd={handleCreateCol}
        onReorder={(reorderedCols) => {
          reorderedCols.forEach((col, index) => {
            handleUpdatePosition(col.id, index + 1);
          });
        }}
      />

      {/* El nuevo ColumnForm ya incluye su propio <Dialog /> */}
      <ColumnForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initialData={selectedColumn}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        onDelete={handleDeleteClick}
        loading={loading}
        error={error}
        tableId={tableId}
        lastPosition={columns.length}
      />

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) handleCancelDelete();
        }}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Columna?"
        message={`¿Estás seguro de que deseas eliminar "${columnToDelete?.name}"?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />


      <TablePreview tableName={tableName} columns={columns} />
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useColumns } from '@/hooks/useColumns';
import ColumnListTable from './ColumnListTable';
import ColumnForm from './ColumnForm';
import Modal from '@/components/commmon/Modal';
import TablePreview from './TablePreview';
import DeleteConfirmationDialog from '@/components/commmon/DeleteConfirmationDialog';

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
  const [formMode, setFormMode] = useState('create'); // 'create' o 'edit'
  const [columnToDelete, setColumnToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (tableId) fetchColumns();
  }, [tableId, fetchColumns]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedColumn(null);
    setFormMode('create');
    setFormError(null);
  };

  const handleDeleteClick = (column) => {
    setColumnToDelete(column);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await handleDelete(columnToDelete);
      setShowDeleteDialog(false);
      setColumnToDelete(null);
      closeModal(); // Opcional, depende de UX
    } catch (err) {
      console.error('Error al eliminar la columna:', err);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setColumnToDelete(null);
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (formMode === 'create') {
        await handleCreate(formData);
      } else if (formMode === 'edit') {
        await handleUpdate(selectedColumn.id, formData);
      }
      fetchColumns();
      closeModal();
    } catch (err) {
      setFormError(err?.message || 'Error al guardar');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    closeModal();
  };

  const handleCreateCol = () => {
    setSelectedColumn(null);
    setFormMode('create');
    openModal();
  };

  const handleEdit = (column) => {
    setSelectedColumn(column);
    setFormMode('edit');
    openModal();
  };

  const handleReorder = useCallback(
    (reorderedCols) => {
      reorderedCols.forEach((col, index) => {
        handleUpdatePosition(col.id, index + 1);
      });
    },
    [handleUpdatePosition]
  );

  return (
    <div>
      <h2>Gestor de Columnas</h2>

      <ColumnListTable
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onAdd={handleCreateCol}
        onReorder={handleReorder}
      />

      <Modal isOpen={isModalOpen} onClose={closeModal} size="large" showCloseButton>
        <ColumnForm
          mode={formMode}
          initialData={selectedColumn}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          onDelete={handleDeleteClick}
          loading={formLoading || loading}
          error={formError || error}
          tableId={tableId}
          lastPosition={columns.length}
        />
      </Modal>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
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

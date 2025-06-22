import React, { useEffect, useState } from 'react';
import { useColumns } from '@/hooks/useColumns';  // Hook para manejar CRUD columnas
import ColumnListTable from './ColumnListTable';
import ColumnForm from './ColumnForm';
import Modal from '@/components/Modal';
import TablePreview from '../TablePreview'
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

export default function ColumnManager({ tableId, tableName }) {
  const {
    columns,
    loading,
    error,
    fetchColumns,
    success,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleUpdatePosition,
    
  } = useColumns(tableId);

  const [selectedColumn, setSelectedColumn] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' o 'edit'
   const [columnToDelete, setColumnToDelete] = useState(null);
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [modalState, setModalState] = React.useState({
      showModal: false,
      formLoading: false,
      formError: null
    });

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
      closeModal();
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
    } else if (formMode === 'edit') {
      await handleUpdate(selectedColumn.id, formData);
    }
    setSelectedColumn(null);
    setFormMode('create');
    fetchColumns();
    setModalState({ showModal: false, formLoading: false, formError: null });
  };

  const handleFormCancel = () => {
    setSelectedColumn(null);
    setFormMode('create');
  };

    const handleCreateCol = (column) => {
    setSelectedColumn(column);
    setFormMode('create');
    setModalState({ showModal: true, formLoading: false, formError: null });
  };

    const handleEdit = (column) => {
    setSelectedColumn(column);
    setFormMode('edit');
    setModalState({ showModal: true, formLoading: false, formError: null });
  };



  const closeModal = () =>
    setModalState({ showModal: false, formLoading: false, formError: null });

  return (
    <div>
      <h2>Gestor de Columnas</h2>

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

      <Modal
        isOpen={modalState.showModal}
        onClose={closeModal}
        size="large"
        showCloseButton
      >
      <ColumnForm
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

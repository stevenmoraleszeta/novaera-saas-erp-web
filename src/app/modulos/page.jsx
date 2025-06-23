'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useModules } from '@/hooks/useModules';
import MainContent from '@/components/MainContent';
import ModuleList from '@/components/modules/ModuleList';
import ModuleFilter from '@/components/modules/ModuleFilter';
import Alert from '@/components/commmon/Alert';
import Modal from '@/components/commmon/Modal';
import ModuleForm from '@/components/modules/ModuleForm';
import { AuthContext } from '../../context/AuthContext';
import DeleteConfirmationDialog from '@/components/commmon/DeleteConfirmationDialog';
import EditToggleButton from '@/components/commmon/EditToggleButton';



export default function ModulesPage() {
  const {
    modules,
    loading,
    error,
    success,
    searchQuery,
    filters,
    sortConfig,
    currentPage,
    totalPages,
    totalModules,
    itemsPerPage,
    handleSearch,
    handleSort,
    handleFilterChange,
    handlePageChange,
    handleCreateModule,
    handleUpdateModule,
    handleDeleteModule,
    clearMessages,
  } = useModules();

  const { user, status } = useContext(AuthContext);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);

  const [modalState, setModalState] = React.useState({
    showModal: false,
    selectedModule: null,
    formLoading: false,
    formError: null
  });

  const handleDeleteClick = (module) => {
    setModuleToDelete(module);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await handleDeleteModule(moduleToDelete);
      setShowDeleteDialog(false);
      setModuleToDelete(null);
      closeModal();
    } catch (err) {
      console.error('Error al eliminar módulo:', err);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setModuleToDelete(null);
  };

   const handleFormCancel = () => {
    setSelectedColumn(null);
    setFormMode('create');
  };

  const openCreateModal = () =>
    setModalState({ showModal: true, selectedModule: null, formLoading: false, formError: null });

  const openEditModal = (module) =>
    setModalState({ showModal: true, selectedModule: module, formLoading: false, formError: null });

  const closeModal = () =>
    setModalState({ showModal: false, selectedModule: null, formLoading: false, formError: null });

  const handleFormSubmit = async (data) => {
    try {
      setModalState((prev) => ({ ...prev, formLoading: true, formError: null }));
      if (modalState.selectedModule) {
        await handleUpdateModule(modalState.selectedModule.id, data);
      } else {
        await handleCreateModule(data);
      }
      closeModal();
    } catch (err) {
      setModalState((prev) => ({
        ...prev,
        formError: err?.response?.data?.error || 'Error al guardar módulo',
        formLoading: false
      }));
    }
  };

  return (
    <MainContent>
      <div className="modules-page">
        {/* Fondo degradado global eliminado para evitar error de estilos anidados. Agrega el fondo en tu CSS global. */}

        {error && <Alert type="error" message={error} onClose={clearMessages} />}

        {success && <Alert type="success" message={success} onClose={clearMessages} />}

        <div className="filter-toolbar">
          <ModuleFilter
            searchQuery={searchQuery}
            filters={filters}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />

          <div className="edit-toggle-container">
            <EditToggleButton onToggle={setIsEditingMode} />
            {isEditingMode && <span className="edit-label">Modo edición</span>}
          </div>
        </div>


        <ModuleList
          modules={modules}
          loading={loading}
          sortConfig={sortConfig}
          onSort={handleSort}
          onAdd={openCreateModal}
          onEdit={openEditModal}
          onDelete={handleDeleteClick}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalModules}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          isEditingMode={isEditingMode}
        />

        <Modal
          isOpen={modalState.showModal}
          onClose={closeModal}
          size="large"
          showCloseButton
        >
          <ModuleForm
            mode={modalState.selectedModule ? 'edit' : 'create'}
            initialData={modalState.selectedModule}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
            onDelete={handleDeleteClick}
            loading={modalState.formLoading}
            error={modalState.formError}
          />
        </Modal>

        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="¿Eliminar módulo?"
          message={`¿Estás seguro de que deseas eliminar "${moduleToDelete?.name}"?`}
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
        />
      </div>

      <style jsx>{`
        .modules-page {
          max-width: 1200px;
          margin: 0 auto;
        }
        .page-header {
          margin-bottom: 1.5em;
        }
        h1 {
          font-size: 2em;
          margin: 0;
        }
        p {
          color: #6b7280;
          margin-bottom: 1em;
        }
        .filter-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .edit-toggle-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .edit-label {
          font-size: 0.9rem;
          color: #10b981;
          font-weight: 500;
        }
      `}</style>
    </MainContent>
  );
}

'use client';

import React, { useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useModules } from '@/hooks/useModules';
import MainContent from '@/components/MainContent';
import ModuleList from '@/components/modules/ModuleList';
import ModuleFilter from '@/components/modules/ModuleFilter';
import Alert from '@/components/commmon/Alert';
import Modal from '@/components/commmon/Modal';
import { AuthContext } from '../../context/AuthContext';
import EditToggleButton from '@/components/commmon/EditToggleButton';

const ModuleForm = React.lazy(() => import('@/components/modules/ModuleForm'));
const DeleteConfirmationDialog = React.lazy(() => import('@/components/commmon/DeleteConfirmationDialog'));

export default function ModulesPage() {
  const { user, status } = useContext(AuthContext);

  if (status !== 'authenticated') return null;

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

  const [isEditingMode, setIsEditingMode] = useState(false);
  const [modalState, setModalState] = useState({
    showModal: false,
    selectedModule: null,
    formLoading: false,
    formError: null,
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  const selectedModuleRef = useRef(null);

  useEffect(() => {
    selectedModuleRef.current = modalState.selectedModule;
  }, [modalState.selectedModule]);

  const openCreateModal = useCallback(() => {
    setModalState({ showModal: true, selectedModule: null, formLoading: false, formError: null });
  }, []);

  const openEditModal = useCallback((module) => {
    setModalState({ showModal: true, selectedModule: module, formLoading: false, formError: null });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ showModal: false, selectedModule: null, formLoading: false, formError: null });
  }, []);

  const handleDeleteClick = useCallback((module) => {
    setModuleToDelete(module);
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await handleDeleteModule(moduleToDelete);
      setShowDeleteDialog(false);
      setModuleToDelete(null);
      closeModal();
    } catch (err) {
      console.error('Error al eliminar módulo:', err);
    }
  }, [handleDeleteModule, moduleToDelete, closeModal]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
    setModuleToDelete(null);
  }, []);

  const handleFormSubmit = useCallback(async (data) => {
    setModalState(prev => ({ ...prev, formLoading: true, formError: null }));
    try {
      if (selectedModuleRef.current) {
        await handleUpdateModule(selectedModuleRef.current.id, data);
      } else {
        await handleCreateModule(data);
      }
      closeModal();
    } catch (err) {
      setModalState(prev => ({
        ...prev,
        formError: err?.response?.data?.error || 'Error al guardar módulo',
        formLoading: false,
      }));
    }
  }, [handleCreateModule, handleUpdateModule, closeModal]);

  return (
    <MainContent>
      <div className="modules-page">
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

        {modalState.showModal && (
          <Modal isOpen={modalState.showModal} onClose={closeModal} size="large" showCloseButton>
            <React.Suspense fallback={<p>Cargando formulario...</p>}>
              <ModuleForm
                mode={modalState.selectedModule ? 'edit' : 'create'}
                initialData={modalState.selectedModule}
                onSubmit={handleFormSubmit}
                onCancel={closeModal}
                onDelete={handleDeleteClick}
                loading={modalState.formLoading}
                error={modalState.formError}
              />
            </React.Suspense>
          </Modal>
        )}

        {showDeleteDialog && (
          <React.Suspense fallback={null}>
            <DeleteConfirmationDialog
              isOpen={showDeleteDialog}
              onClose={handleCancelDelete}
              onConfirm={handleConfirmDelete}
              title="¿Eliminar módulo?"
              message={`¿Estás seguro de que deseas eliminar "${moduleToDelete?.name}"?`}
              confirmText="Sí, eliminar"
              cancelText="Cancelar"
            />
          </React.Suspense>
        )}
      </div>

      <style jsx>{`
        .modules-page {
          max-width: 1200px;
          margin: 0 auto;
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

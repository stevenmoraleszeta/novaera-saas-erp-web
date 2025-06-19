'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useModules } from '@/hooks/useModules';
import MainContent from '@/components/MainContent';
import ModuleList from '@/components/ModuleList';
import ModuleFilter from '@/components/ModuleFilter';
import Alert from '@/components/Alert';
import Button from '@/components/Button';
import { PiPlusBold } from 'react-icons/pi';
import Modal from '@/components/Modal';
import ModuleForm from '@/components/ModuleForm';
import { AuthContext } from '../../context/AuthContext';

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
    clearMessages
  } = useModules();

  const { user, status } = useContext(AuthContext);

  const [modalState, setModalState] = React.useState({
    showModal: false,
    selectedModule: null,
    formLoading: false,
    formError: null
  });

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


        {error && <Alert type="error" message={error} onClose={clearMessages} />}
        {/* Demo Mode Indicator */}
        {user?.email?.includes('demo.com') && (
        <Alert
            type="info"
            message="🚀 Modo Demo: Las acciones están simuladas. Conecta tu backend para funcionalidad real."
        />
        )}

        {success && <Alert type="success" message={success} onClose={clearMessages} />}

        <ModuleFilter
          searchQuery={searchQuery}
          filters={filters}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />

        <ModuleList
          modules={modules}
          loading={loading}
          sortConfig={sortConfig}
          onSort={handleSort}
          onEdit={openEditModal}
          onDelete={handleDeleteModule}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalModules}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
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
            loading={modalState.formLoading}
            error={modalState.formError}
          />
        </Modal>
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
      `}</style>
    </MainContent>
  );
}

"use client";

import React, { useState } from "react";
import { useModules } from "@/hooks/useModules";
import ModuleList from "@/components/modules/ModuleList";
import Alert from "@/components/common/Alert";
import ModuleForm from "@/components/modules/ModuleForm";
import useUserStore from "@/stores/userStore";
import { useEffect } from "react";
import { useEditMode } from "@/hooks/useEditMode";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { Badge } from "@/components/ui/badge";
import { Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";

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

  const { user } = useUserStore();
  const { isEditingMode, isHydrated } = useEditMode();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  // Debug: Log del modo edición
  console.log("🔧 ModulesPage - Modo edición:", isEditingMode, "Hidratado:", isHydrated);

  const [modalState, setModalState] = React.useState({
    showModal: false,
    selectedModule: null,
    formLoading: false,
    formError: null,
  });

  const handleDeleteClick = (module) => {
    setModuleToDelete(module);
    setShowDeleteDialog(true);
    console.log("USUARIO:", user);
  };

  const handleConfirmDelete = async () => {
    try {
      // Por defecto usar cascada = true para eliminar tablas relacionadas
      await handleDeleteModule(moduleToDelete.id, true);
      setShowDeleteDialog(false);
      setModuleToDelete(null);
      closeModal();
    } catch (err) {
      console.error("Error al eliminar módulo:", err);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setModuleToDelete(null);
  };

  const openCreateModal = () =>
    setModalState({
      showModal: true,
      selectedModule: null,
      formLoading: false,
      formError: null,
    });

  const openEditModal = (module) =>
    setModalState({
      showModal: true,
      selectedModule: module,
      formLoading: false,
      formError: null,
    });

  const closeModal = () =>
    setModalState({
      showModal: false,
      selectedModule: null,
      formLoading: false,
      formError: null,
    });

  const handleFormSubmit = async (data) => {
    try {
      setModalState((prev) => ({
        ...prev,
        formLoading: true,
        formError: null,
      }));
      if (modalState.selectedModule) {
        await handleUpdateModule(modalState.selectedModule.id, data);
      } else {
        await handleCreateModule(data);
      }
      closeModal();
    } catch (err) {
      setModalState((prev) => ({
        ...prev,
        formError: err?.response?.data?.error || "Error al guardar módulo",
        formLoading: false,
      }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {error && <Alert type="error" message={error} onClose={clearMessages} />}

      {success && (
        <Alert type="success" message={success} onClose={clearMessages} />
      )}

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
      />

      <ModuleForm
        open={modalState.showModal}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        mode={modalState.selectedModule ? "edit" : "create"}
        initialData={modalState.selectedModule}
        onSubmit={handleFormSubmit}
        onCancel={closeModal}
        onDelete={handleDeleteClick}
        loading={modalState.formLoading}
        error={modalState.formError}
      />

      <DeleteConfirmationModal
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) handleCancelDelete();
        }}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar módulo?"
        message={`Esta acción eliminará permanentemente el módulo "${moduleToDelete?.name}" y todas sus tablas relacionadas (columnas, registros, etc.). Esta acción no se puede deshacer.`}
        itemName={moduleToDelete?.name}
      />
    </div>
  );
}

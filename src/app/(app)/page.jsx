"use client";

import React, { useState, useEffect } from "react";
import { useModules } from "@/hooks/useModules";
import ModuleList from "@/components/ModuleList";
import Alert from "@/components/Alert";
import ModuleForm from "@/components/ModuleForm";
import useUserStore from "@/stores/userStore";
import useEditModeStore from "@/stores/editModeStore";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
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
  const { isEditingMode } = useEditModeStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  const [modalState, setModalState] = React.useState({
    showModal: false,
    selectedModule: null,
    formLoading: false,
    formError: null,
  });

  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  const handleDeleteClick = (module) => {
    setModuleToDelete(module);
    setShowDeleteDialog(true);
    console.log("USUARIO:", user);
  };

  const handleConfirmDelete = async () => {
    try {
      await handleDeleteModule(moduleToDelete.id);
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

  if (!user) {
    return null; // O un loader/spinner si prefieres
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {error && <Alert type="error" message={error} onClose={clearMessages} />}

      {success && (
        <Alert type="success" message={success} onClose={clearMessages} />
      )}

      {isEditingMode && (
        <div className="mb-8">
          <Badge
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Edit3 className="w-5 h-5" />
            Modo edición
          </Badge>
        </div>
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
        isEditingMode={isEditingMode}
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
        itemName={moduleToDelete?.name}
      />
    </div>
  );
}

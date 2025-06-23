"use client";

import React, { useState, useEffect } from "react";
import useUserStore from "@/stores/userStore";
import useEditModeStore from "@/stores/editModeStore";
import { Badge } from "@/components/ui/badge";
import { Edit3 } from "lucide-react";
import Alert from "@/components/Alert";
import UserForm from "@/components/UserForm";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import UserList from "@/components/UserList";

export default function UsuariosPage() {
  const { user } = useUserStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { isEditingMode } = useEditModeStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [modalState, setModalState] = React.useState({
    showModal: false,
    selectedUser: null,
    formLoading: false,
    formError: null,
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUsers = [
          {
            id: 1,
            name: "Juan Pérez",
            email: "juan.perez@empresa.com",
            role: "Administrador",
            department: "IT",
            status: "Activo",
            createdAt: "2024-01-15",
            lastLogin: "2024-01-20T10:30:00Z",
          },
          {
            id: 2,
            name: "María García",
            email: "maria.garcia@empresa.com",
            role: "Usuario",
            department: "Ventas",
            status: "Activo",
            createdAt: "2024-01-16",
            lastLogin: "2024-01-19T14:20:00Z",
          },
          {
            id: 3,
            name: "Carlos López",
            email: "carlos.lopez@empresa.com",
            role: "Supervisor",
            department: "Recursos Humanos",
            status: "Inactivo",
            createdAt: "2024-01-17",
            lastLogin: "2024-01-18T09:15:00Z",
          },
        ];

        setUsers(mockUsers);
        setTotalUsers(mockUsers.length);
        setTotalPages(Math.ceil(mockUsers.length / itemsPerPage));
      } catch (err) {
        setError("Error al cargar usuarios");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [itemsPerPage]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCreateUser = async (data) => {
    try {
      setModalState((prev) => ({
        ...prev,
        formLoading: true,
        formError: null,
      }));
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newUser = {
        id: Date.now(),
        ...data,
        createdAt: new Date().toISOString(),
        lastLogin: null,
      };

      setUsers((prev) => [...prev, newUser]);
      setSuccess("Usuario creado exitosamente");
      closeModal();
    } catch (err) {
      setModalState((prev) => ({
        ...prev,
        formError: "Error al crear usuario",
        formLoading: false,
      }));
    }
  };

  const handleUpdateUser = async (id, data) => {
    try {
      setModalState((prev) => ({
        ...prev,
        formLoading: true,
        formError: null,
      }));
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, ...data } : user))
      );
      setSuccess("Usuario actualizado exitosamente");
      closeModal();
    } catch (err) {
      setModalState((prev) => ({
        ...prev,
        formError: "Error al actualizar usuario",
        formLoading: false,
      }));
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setSuccess("Usuario eliminado exitosamente");
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (err) {
      setError("Error al eliminar usuario");
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await handleDeleteUser(userToDelete);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setUserToDelete(null);
  };

  const openCreateModal = () =>
    setModalState({
      showModal: true,
      selectedUser: null,
      formLoading: false,
      formError: null,
    });

  const openEditModal = (user) =>
    setModalState({
      showModal: true,
      selectedUser: user,
      formLoading: false,
      formError: null,
    });

  const closeModal = () =>
    setModalState({
      showModal: false,
      selectedUser: null,
      formLoading: false,
      formError: null,
    });

  const handleFormSubmit = async (data) => {
    try {
      if (modalState.selectedUser) {
        await handleUpdateUser(modalState.selectedUser.id, data);
      } else {
        await handleCreateUser(data);
      }
    } catch (err) {
      console.error("Error in form submit:", err);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

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

      <UserList
        users={users}
        loading={loading}
        onAdd={openCreateModal}
        onEdit={openEditModal}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalUsers}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        isEditingMode={isEditingMode}
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      <UserForm
        open={modalState.showModal}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        mode={modalState.selectedUser ? "edit" : "create"}
        initialData={modalState.selectedUser}
        onSubmit={handleFormSubmit}
        onCancel={closeModal}
        onDelete={handleDeleteClick}
        loading={modalState.formLoading}
        error={modalState.formError}
      />

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) handleCancelDelete();
        }}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar usuario?"
        message={`¿Estás seguro de que deseas eliminar "${userToDelete?.name}"?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}

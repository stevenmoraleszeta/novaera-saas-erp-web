"use client";

import React, { useState, useEffect } from "react";
import useEditModeStore from "@/stores/editModeStore";
import UserRoleModal from "@/components/users/UserRoleModal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import UsersTableView from "@/components/users/UsersTableView";
import { createUser, updateUser, deleteUser } from "@/services/userService";

export default function UsuariosPage() {
  const { isEditingMode } = useEditModeStore();
  const [refreshFlag, setRefreshFlag] = useState(false);
  
  // Estados para el modal unificado
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserRoleModalOpen, setIsUserRoleModalOpen] = useState(false);
  
  // Estados para eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  // Función para gestionar roles (placeholder)
  const handleManageRoles = () => {
    console.log('Gestionar roles - funcionalidad pendiente');
    // Aquí puedes agregar la lógica para gestionar roles globalmente
  };

  // Función para manejar la selección de un usuario desde la tabla
  const handleUserSelected = (user) => {
    console.log('User selected:', user);
    setSelectedUser(user);
    setIsUserRoleModalOpen(true);
  };

  // Funciones para CRUD de usuarios
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsUserRoleModalOpen(true);
  };

  const handleSaveUser = async (userData) => {
    setSaving(true);
    try {
      let result;
      if (selectedUser) {
        // Editar usuario existente
        const userId = selectedUser.record_data?.id || selectedUser.id;
        result = await updateUser(userId, userData);
      } else {
        // Crear nuevo usuario
        result = await createUser(userData);
      }
      
      // Refrescar tabla
      setRefreshFlag(!refreshFlag);
      return result; // Retornar el resultado para que el modal pueda obtener el ID
    } catch (error) {
      console.error('Error saving user:', error);
      throw error; // Re-lanzar el error para que el modal lo maneje
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
    
    // Cerrar el modal de usuario si está abierto
    if (isUserRoleModalOpen) {
      setIsUserRoleModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setSaving(true);
    try {
      const userId = userToDelete.record_data?.id || userToDelete.id;
      await deleteUser(userId, 'fisica'); // Eliminar físicamente
      
      // Refrescar tabla
      setRefreshFlag(!refreshFlag);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      {/* Componente de tabla de usuarios */}
      <UsersTableView
        refresh={refreshFlag}
        onRowClick={handleUserSelected}
        onManageRoles={handleManageRoles}
        onCreateUser={handleCreateUser}
        showCreateButton={true}
        showActionButtons={isEditingMode}
      />

      {/* Modal unificado para usuario y roles */}
      <UserRoleModal
        open={isUserRoleModalOpen}
        onOpenChange={setIsUserRoleModalOpen}
        user={selectedUser}
        onSaveUser={handleSaveUser}
        onDeleteUser={handleDeleteUser}
        loading={saving}
      />

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario "${userToDelete?.name || userToDelete?.record_data?.name || 'Sin nombre'}"?`}
        onConfirm={handleConfirmDelete}
        loading={saving}
      />
    </div>
  );
}

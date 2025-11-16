"use client";

import React, { useState, useEffect } from "react";
import useEditModeStore from "@/stores/editModeStore";
import RolePermissionsModal from "@/components/roles/RolePermissionsModal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import RolesTableView from "@/components/roles/RolesTableView";
import { createRole, updateRole, deleteRole } from "@/services/roleService";
import { sincronizarTablaRoles } from "@/services/rolesTableManager";
import { useLogicalTables } from "@/hooks/useLogicalTables";
import { useColumns } from "@/hooks/useColumns";
import { useRoles } from '@/hooks/useRoles';

export default function RolesPage() {
  const { isEditingMode } = useEditModeStore();
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Estados para el modal unificado
  const [selectedRole, setSelectedRole] = useState(null);
  const [isRolePermissionsModalOpen, setIsRolePermissionsModalOpen] = useState(false);

  // Estados para eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const { createOrUpdateTable } = useLogicalTables(null);
  const { handleCreate } = useColumns(null);
  const { roles, getAllRoles } = useRoles();

  // Función para gestionar colaboradores (placeholder)
  const handleManageCollaborators = () => {
    console.log('Gestionar colaboradores - funcionalidad pendiente');
    // Aquí puedes agregar la lógica para gestionar colaboradores
  };

  // Función para manejar la selección de un rol desde la tabla
  const handleRoleSelected = (role) => {
    console.log('Role selected:', role);
    setSelectedRole(role);
    setIsRolePermissionsModalOpen(true);
  };

  // Funciones para CRUD de roles
  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsRolePermissionsModalOpen(true);
  };

  const handleSaveRole = async (roleData) => {
    setSaving(true);
    try {
      let result;
      if (selectedRole) {
        // Editar rol existente
        const roleId = selectedRole.record_data?.id || selectedRole.id;
        const fullRoleData = {
          id: roleId,
          name: roleData.nombre,
          description: roleData.description || "",
          is_admin: roleData.is_admin,
        };
        result = await updateRole(fullRoleData);
        const updatedRoles = await getAllRoles()
        syncRoles(updatedRoles)

      } else {
        // Crear nuevo rol
        result = await createRole(roleData);
      }

      // Refrescar tabla
      setRefreshFlag(!refreshFlag);
      return result; // Retornar el resultado para que el modal pueda obtener el ID
    } catch (error) {
      console.error('Error saving role:', error);
      throw error; // Re-lanzar el error para que el modal lo maneje
    } finally {
      setSaving(false);
    }
  };

  const syncRoles = async (rolesToSync) => {
    await sincronizarTablaRoles({
      roles: rolesToSync,
      userId: null,
      createOrUpdateTable,
      handleCreate,
    });
    setRefreshFlag((prev) => !prev);
  }

  const handleDeleteRole = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);

    // Cerrar el modal de permisos si está abierto
    if (isRolePermissionsModalOpen) {
      setIsRolePermissionsModalOpen(false);
      setSelectedRole(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    setSaving(true);
    try {
      const roleId = roleToDelete.record_data?.id || roleToDelete.id;
      await deleteRole(roleId);

      // Refrescar tabla
      setRefreshFlag(!refreshFlag);
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      console.error('Error deleting role:', error);
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      {/* Componente de tabla de roles */}
      <RolesTableView
        refresh={refreshFlag}
        onRowClick={handleRoleSelected}
        onManageCollaborators={handleManageCollaborators}
        onCreateRole={handleCreateRole}
        showCreateButton={true}
        showActionButtons={isEditingMode}
      />

      {/* Modal unificado para rol y permisos */}
      <RolePermissionsModal
        open={isRolePermissionsModalOpen}
        onOpenChange={setIsRolePermissionsModalOpen}
        role={selectedRole}
        onSaveRole={handleSaveRole}
        onDeleteRole={handleDeleteRole}
        loading={saving}
      />

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Eliminar Rol"
        message={`¿Estás seguro de que deseas eliminar el rol "${roleToDelete?.name || roleToDelete?.record_data?.name || 'Sin nombre'}"?`}
        onConfirm={handleConfirmDelete}
        loading={saving}
      />
    </div>
  );
}

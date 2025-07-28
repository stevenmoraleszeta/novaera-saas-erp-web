"use client";

import React, { useState, useEffect } from "react";
import useEditModeStore from "@/stores/editModeStore";
import PermissionsMatrix from "@/components/roles/PermissionsMatrix";
import RoleModal from "@/components/roles/RoleModal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import RolesTableView from "@/components/roles/RolesTableView";
import { createRole, updateRole, deleteRole } from "@/services/roleService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2 } from "lucide-react";

export default function RolesPage() {
  const { isEditingMode } = useEditModeStore();
  const [refreshFlag, setRefreshFlag] = useState(false);
  
  // Estados para permisos
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  
  // Estados para CRUD de roles
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  // Función para gestionar colaboradores (placeholder)
  const handleManageCollaborators = () => {
    console.log('Gestionar colaboradores - funcionalidad pendiente');
    // Aquí puedes agregar la lógica para gestionar colaboradores
  };

  // Función para manejar la selección de un rol desde la tabla
  const handleRoleSelected = (role) => {
    console.log('Role selected:', role);
    
    if (isEditingMode) {
      // En modo edición, abrir modal de edición
      setRoleToEdit(role);
      setIsRoleModalOpen(true);
    } else {
      // En modo normal, abrir modal de permisos
      setSelectedRoleForPermissions(role);
      setIsPermissionsModalOpen(true);
    }
  };

  // Funciones para CRUD de roles
  const handleCreateRole = () => {
    setRoleToEdit(null);
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role) => {
    setRoleToEdit(role);
    setIsRoleModalOpen(true);
  };

  const handleDeleteRole = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
    
    // Si se está llamando desde el modal de edición, cerrarlo
    if (isRoleModalOpen) {
      setIsRoleModalOpen(false);
      setRoleToEdit(null);
    }
  };

  const handleSaveRole = async (roleData) => {
    setSaving(true);
    try {
      if (roleToEdit) {
        // Editar rol existente
        const roleId = roleToEdit.id;
        await updateRole(roleId, roleData);
      } else {
        // Crear nuevo rol
        await createRole(roleData);
      }
      
      // Refrescar tabla
      setRefreshFlag(!refreshFlag);
      setIsRoleModalOpen(false);
      setRoleToEdit(null);
    } catch (error) {
      console.error('Error saving role:', error);
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    
    setSaving(true);
    try {
      const roleId = roleToDelete.id;
      await deleteRole(roleId);
      
      // Refrescar tabla
      setRefreshFlag(!refreshFlag);
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
      
      // Cerrar modal de edición si estaba abierto
      if (isRoleModalOpen) {
        setIsRoleModalOpen(false);
        setRoleToEdit(null);
      }
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
        showCreateButton={isEditingMode}
        showActionButtons={isEditingMode}
      />

      {/* Modal de permisos */}
      <Dialog open={isPermissionsModalOpen} onOpenChange={setIsPermissionsModalOpen}>
        <DialogContent className="max-w-6xl h-[85vh] flex flex-col z-[9999] top-[5%] translate-y-0 mt-16">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                Gestión de Permisos
                {selectedRoleForPermissions && (
                  <span className="text-base font-normal text-muted-foreground ml-2">
                    - {selectedRoleForPermissions.name || 'Rol sin nombre'}
                  </span>
                )}
              </DialogTitle>
              
              {/* Botones de edición y eliminación en el modal de permisos */}
              {isEditingMode && selectedRoleForPermissions && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleEditRole(selectedRoleForPermissions);
                      setIsPermissionsModalOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar Rol
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleDeleteRole(selectedRoleForPermissions);
                      setIsPermissionsModalOpen(false);
                    }}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar Rol
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 py-4">
            <PermissionsMatrix
              selectedRole={selectedRoleForPermissions}
              onPermissionsChange={() => {
                // Opcional: recargar datos si es necesario
                console.log('Permisos actualizados');
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para crear/editar rol */}
      <RoleModal
        open={isRoleModalOpen}
        onOpenChange={setIsRoleModalOpen}
        role={roleToEdit}
        onSave={handleSaveRole}
        onDelete={handleDeleteRole}
        loading={saving}
        showDeleteButton={isEditingMode && roleToEdit !== null}
      />

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Eliminar Rol"
        message={`¿Estás seguro de que deseas eliminar el rol "${roleToDelete?.name || 'Sin nombre'}"?`}
        onConfirm={handleConfirmDelete}
        loading={saving}
      />
    </div>
  );
}

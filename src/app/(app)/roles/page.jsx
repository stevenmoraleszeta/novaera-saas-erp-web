"use client";

import React, { useState, useEffect } from "react";
import useEditModeStore from "@/stores/editModeStore";
import LogicalTableDataView from "@/components/tables/LogicalTableDataView";
import PermissionsMatrix from "@/components/roles/PermissionsMatrix";
import { getRolesTableId } from "@/services/roleService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RolesPage() {
  const { isEditingMode } = useEditModeStore();
  const [rolesTableId, setRolesTableId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRolesTableId = async () => {
      try {
        const tableId = await getRolesTableId();
        setRolesTableId(tableId);
      } catch (error) {
        console.error('Error fetching roles table ID:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRolesTableId();
  }, []);

  // Función para manejar la selección de un rol desde la tabla
  const handleRoleSelected = (role) => {
    console.log('Role selected:', role);
    setSelectedRoleForPermissions(role);
    setIsPermissionsModalOpen(true);
  };

  const handleClosePermissionsModal = () => {
    setIsPermissionsModalOpen(false);
    setSelectedRoleForPermissions(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Cargando roles...</p>
        </div>
      </div>
    );
  }

  if (!rolesTableId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-medium mb-2">Error al cargar roles</h3>
          <p className="text-sm">No se pudo encontrar la tabla de roles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      {/* Tabla de roles */}
      <LogicalTableDataView 
        tableId={rolesTableId}
        refresh={refreshFlag}
        onRowClick={handleRoleSelected}
      />

      {/* Modal de permisos */}
      <Dialog open={isPermissionsModalOpen} onOpenChange={setIsPermissionsModalOpen}>
          <DialogContent className="max-w-6xl h-[85vh] flex flex-col z-[9999] top-[5%] translate-y-0 mt-16">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-xl font-semibold">
                Gestión de Permisos
                {selectedRoleForPermissions && (
                  <span className="text-base font-normal text-muted-foreground ml-2">
                    - {selectedRoleForPermissions.record_data?.nombre || selectedRoleForPermissions.name || 'Rol sin nombre'}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto min-h-0 py-4">
              <PermissionsMatrix
                selectedRole={selectedRoleForPermissions}
                setRefreshFlag= {setRefreshFlag}
                onPermissionsChange={() => {
                  //setRefreshFlag((prev) => !prev);
                  // Opcional: recargar datos si es necesario
                  console.log('Permisos actualizados');
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}

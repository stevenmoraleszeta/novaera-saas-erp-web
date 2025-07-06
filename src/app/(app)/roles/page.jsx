"use client";

import React from "react";
import RolesTable from "@/components/roles/RolesTable";
import SearchBar from "@/components/common/SearchBar";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/common/Button";
import RoleForm from "@/components/roles/RoleForm";
import RolePermissionsModal from "@/components/roles/RolePermissionsModal";
import PermissionsMatrix from "@/components/roles/PermissionsMatrix";
import { useRoles } from "@/hooks/useRoles";
import MainContent from "@/components/MainContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RolesPage() {
  const {
    roles,
    loading,
    error,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    handleCreateRole,
    handleEditRole,
    handleDeleteRole,
    modalOpen,
    setModalOpen,
    editingRole,
    handleSaveRole,
    permissions,
  } = useRoles();

  const [viewPermsModal, setViewPermsModal] = React.useState(false);
  const [rolePerms, setRolePerms] = React.useState([]);
  const [rolePermsLoading, setRolePermsLoading] = React.useState(false);
  const [rolePermsError, setRolePermsError] = React.useState(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = React.useState(null);
  const { getPermissionsByRole } = require("@/services/permissionsService");

  const handleViewPermissions = async (role) => {
    setRolePermsLoading(true);
    setViewPermsModal(true);
    setRolePermsError(null);
    try {
      const perms = await getPermissionsByRole(role.id);
      setRolePerms(perms);
    } catch (e) {
      setRolePermsError("No se pudieron cargar los permisos");
      setRolePerms([]);
    } finally {
      setRolePermsLoading(false);
    }
  };

  const handleSelectRoleForPermissions = (role) => {
    setSelectedRoleForPermissions(role);
  };

  return (
    <MainContent>
      <div className="roles-page space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Panel izquierdo - Lista de roles */}
          <div className="lg:w-1/2">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <SearchBar
                    value={search}
                    onSearch={setSearch}
                    placeholder="Buscar rol por nombre..."
                    className="flex-1 mr-4"
                  />
                  <Button onClick={handleCreateRole}>Crear nuevo rol</Button>
                </div>
                <RolesTable
                  roles={roles}
                  loading={loading}
                  error={error}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                  onViewPermissions={handleViewPermissions}
                  onSelectForPermissions={handleSelectRoleForPermissions}
                  selectedRole={selectedRoleForPermissions}
                />
                <div className="mt-4">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel derecho - Gestión de permisos */}
          <div className="lg:w-1/2">
            <PermissionsMatrix
              selectedRole={selectedRoleForPermissions}
              onPermissionsChange={() => {
                // Opcional: recargar datos si es necesario
                console.log('Permisos actualizados');
              }}
            />
          </div>
        </div>

        {/* Modales */}
        <RoleForm
          open={modalOpen}
          onOpenChange={(open) => setModalOpen(open)}
          initialData={editingRole}
          permissions={permissions}
          onSubmit={handleSaveRole}
          onCancel={() => setModalOpen(false)}
          loading={loading}
        />
        <RolePermissionsModal
          open={viewPermsModal}
          onOpenChange={(open) => setViewPermsModal(open)}
          permissions={rolePerms}
          loading={rolePermsLoading}
          error={rolePermsError}
        />
      </div>
    </MainContent>
  );
}

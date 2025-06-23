"use client";

import React from "react";
import RolesTable from "../../components/RolesTable";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import Button from "../../components/Button";
import RoleForm from "../../components/RoleForm";
import RolePermissionsModal from "../../components/RolePermissionsModal";
import { useRoles } from "../../hooks/useRoles";
import MainContent from "../../components/MainContent";

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
  const { getPermissionsByRole } = require("../../services/permissionsService");

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

  return (
    <MainContent>
      <div className="roles-page">
        <h1>Gestión de Roles</h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <SearchBar
            value={search}
            onSearch={setSearch}
            placeholder="Buscar rol por nombre..."
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
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
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

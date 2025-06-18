"use client";

import React from 'react';
import RolesTable from '../../components/RolesTable';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import RoleForm from '../../components/RoleForm';
import { useRoles } from '../../hooks/useRoles';

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
    permissions
  } = useRoles();

  return (
    <div>
      <h1>Gestión de Roles</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar rol por nombre..." />
        <Button onClick={handleCreateRole}>Crear nuevo rol</Button>
      </div>
      <RolesTable
        roles={roles}
        loading={loading}
        error={error}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <RoleForm
          initialData={editingRole}
          permissions={permissions}
          onSubmit={handleSaveRole}
          onCancel={() => setModalOpen(false)}
          loading={loading}
        />
      </Modal>
    </div>
  );
}

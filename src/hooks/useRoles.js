"use client";
import { useState, useEffect } from 'react';
import { useAxiosAuth } from '../hooks/useAxiosAuth';
import { getPermissionsByRole } from '../services/permissionsService';

export function useRoles() {
  const axios = useAxiosAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    // eslint-disable-next-line
  }, [page, search]);

  const fetchRoles = async () => {
    console.log("issue heeeeeeeeeeeeeeeelp")
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/roles', { params: { page, search } });
      console.log("issue heeeeeeeeeeeeeeeelp222", res.data)
      setRoles((res.data || []).map(r => ({
        id: r.id,
        name: r.name,
        is_admin: r.is_admin
      })));
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await axios.get('/permissions');
      setPermissions(res.data || []);
    } catch {
      setPermissions([]);
    }
  };

  const getRoleById = async (id) => {
    const res = await axios.get(`/roles/${id}`);
    return res.data;
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const handleEditRole = async (role) => {
    setLoading(true);
    try {
      // Esperar a que el catálogo de permisos esté cargado
      if (!permissions || permissions.length === 0) {
        await fetchPermissions();
      }
      const perms = await getPermissionsByRole(role.id);
      let selectedPerms = [];
      perms.forEach((perm) => {
        const table = permissions.find(
          (group) => group.table_id === perm.table_id || group.module.toLowerCase() === perm.table_name?.toLowerCase()
        );
        if (table && table.actions) {
          if (perm.can_read) selectedPerms.push(table.actions.find(a => a.id.startsWith('read_'))?.id);
          if (perm.can_create) selectedPerms.push(table.actions.find(a => a.id.startsWith('create_'))?.id);
          if (perm.can_update) selectedPerms.push(table.actions.find(a => a.id.startsWith('update_'))?.id);
          if (perm.can_delete) selectedPerms.push(table.actions.find(a => a.id.startsWith('delete_'))?.id);
        }
      });
      selectedPerms = selectedPerms.filter(Boolean);
      setEditingRole({ ...role, permissions: selectedPerms });
      setModalOpen(true);
    } catch (e) {
      setEditingRole({ ...role, permissions: [] });
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async (roleData) => {
    setLoading(true);
    setError(null);
    try {
      if (editingRole) {
        await axios.put(`/roles/${editingRole.id}`, roleData);
      } else {
        await axios.post('/roles', roleData);
      }
      setModalOpen(false);
      fetchRoles();
    } catch {
      setError('No se pudo guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`¿Eliminar el rol "${role.name}"?`)) return;
    try {
      await axios.delete(`/roles/${role.id}`);
      fetchRoles();
    } catch {
      setError('No se pudo eliminar el rol');
    }
  };

  return {
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
    getRoleById,
    permissions,
    fetchRoles
  };
}

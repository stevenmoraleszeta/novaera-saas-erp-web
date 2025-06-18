"use client";
import { useState, useEffect } from 'react';
import { useAxiosAuth } from '../hooks/useAxiosAuth';

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
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/roles', { params: { page, search } });
      setRoles((res.data || []).map(r => ({
        id: r.rol_id,
        name: r.rol_name,
        description: r.rol_description,
        active: r.rol_active
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

  const handleEditRole = (role) => {
    setEditingRole(role);
    setModalOpen(true);
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
    permissions
  };
}

import { useState, useEffect } from 'react';
import { useAxiosAuth } from './useAxiosAuth';
import useUserStore from '../stores/userStore';

export const useTableCollaborators = (tableId) => {
  const axios = useAxiosAuth();
  const { user } = useUserStore();
  const [collaborators, setCollaborators] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener colaboradores de una tabla
  const fetchCollaborators = async () => {
    // Only fetch collaborators if user is authenticated and tableId is provided
    if (!tableId || !user) {
      console.log('useTableCollaborators: User not authenticated or no tableId, skipping collaborators fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/table-collaborators/table/${tableId}`);
      setCollaborators(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar colaboradores');
      console.error('Error fetching collaborators:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener usuarios disponibles para asignar
  const fetchAvailableUsers = async () => {
    // Only fetch available users if user is authenticated and tableId is provided
    if (!tableId || !user) {
      console.log('useTableCollaborators: User not authenticated or no tableId, skipping available users fetch');
      return;
    }
    
    try {
      const response = await axios.get(`/table-collaborators/table/${tableId}/available-users`);
      setAvailableUsers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching available users:', err);
    }
  };

  // Asignar colaboradores
  const assignCollaborators = async (userIds, notes = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/table-collaborators/table/${tableId}/assign`, {
        userIds,
        notes
      });
      
      // Recargar la lista de colaboradores
      await fetchCollaborators();
      await fetchAvailableUsers();
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al asignar colaboradores';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Remover colaborador
  const removeCollaborator = async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/table-collaborators/table/${tableId}/user/${userId}`);
      
      // Recargar la lista de colaboradores
      await fetchCollaborators();
      await fetchAvailableUsers();
      
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al remover colaborador';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar colaboradores (reemplazar lista completa)
  const syncCollaborators = async (userIds) => {
    setLoading(true);
    setError(null);
    
    try {
      // Primero obtener colaboradores actuales
      const currentCollaborators = collaborators.map(c => c.user_id);
      
      // Usuarios a agregar
      const usersToAdd = userIds.filter(id => !currentCollaborators.includes(id));
      
      // Usuarios a remover
      const usersToRemove = currentCollaborators.filter(id => !userIds.includes(id));
      
      // Agregar nuevos colaboradores
      if (usersToAdd.length > 0) {
        await assignCollaborators(usersToAdd);
      }
      
      // Remover colaboradores
      for (const userId of usersToRemove) {
        await removeCollaborator(userId);
      }
      
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al sincronizar colaboradores';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales cuando cambia el tableId
  useEffect(() => {
    // Only fetch data if user is authenticated and tableId is provided
    if (tableId && user) {
      fetchCollaborators();
      fetchAvailableUsers();
    }
  }, [tableId, user]);

  return {
    collaborators,
    availableUsers,
    loading,
    error,
    fetchCollaborators,
    fetchAvailableUsers,
    assignCollaborators,
    removeCollaborator,
    syncCollaborators,
    refreshData: () => {
      fetchCollaborators();
      fetchAvailableUsers();
    }
  };
};

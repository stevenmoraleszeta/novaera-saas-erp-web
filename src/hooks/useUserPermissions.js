// Hook para manejar permisos del usuario
import { useState, useEffect } from 'react';
import { getMyPermissions, getMyPermissionsForAllTables } from '../services/permissionsService';
import useUserStore from '../stores/userStore';

export const useUserPermissions = (tableId = null) => {
  const [permissions, setPermissions] = useState({
    can_create: false,
    can_read: false,
    can_update: false,
    can_delete: false
  });
  const [allTablePermissions, setAllTablePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useUserStore();

  // Cargar permisos para una tabla específica
  useEffect(() => {
    if (tableId && user?.id) {
      const loadPermissions = async () => {
        try {
          setLoading(true);
          setError(null);
          const perms = await getMyPermissions(tableId);
          setPermissions(perms);
        } catch (err) {
          console.error('Error loading permissions:', err);
          setError(err.message);
          // Si hay error, asumir sin permisos
          setPermissions({
            can_create: false,
            can_read: false,
            can_update: false,
            can_delete: false
          });
        } finally {
          setLoading(false);
        }
      };
      
      loadPermissions();
    } else if (!tableId && user?.id) {
      // Si no hay tableId, cargar permisos para todas las tablas
      const loadAllPermissions = async () => {
        try {
          setLoading(true);
          setError(null);
          const perms = await getMyPermissionsForAllTables();
          setAllTablePermissions(perms);
        } catch (err) {
          console.error('Error loading all permissions:', err);
          setError(err.message);
          setAllTablePermissions({});
        } finally {
          setLoading(false);
        }
      };
      
      loadAllPermissions();
    } else {
      setLoading(false);
    }
  }, [tableId, user?.id]);

  // Función para verificar un permiso específico
  const hasPermission = (permission) => {
    return permissions[permission] || false;
  };

  // Función para verificar si tiene al menos un permiso
  const hasAnyPermission = () => {
    return Object.values(permissions).some(perm => perm);
  };

  // Función para verificar múltiples permisos
  const hasPermissions = (permissionList) => {
    return permissionList.every(perm => permissions[perm]);
  };

  // Función para obtener permisos de una tabla específica (cuando se cargan todos)
  const getTablePermissions = (tableId) => {
    return allTablePermissions[tableId] || {
      can_create: false,
      can_read: false,
      can_update: false,
      can_delete: false
    };
  };

  return {
    permissions,
    allTablePermissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasPermissions,
    getTablePermissions,
    // Métodos de conveniencia
    canCreate: hasPermission('can_create'),
    canRead: hasPermission('can_read'),
    canUpdate: hasPermission('can_update'),
    canDelete: hasPermission('can_delete'),
  };
};

export default useUserPermissions;

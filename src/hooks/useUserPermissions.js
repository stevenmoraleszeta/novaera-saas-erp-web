// Hook para manejar permisos del usuario
import { useState, useEffect } from 'react';
import { getMyPermissions, getMyPermissionsForAllTables } from '../services/permissionsService';
import useUserStore from '../stores/userStore';
import { useIsAdmin } from './useIsAdmin';

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
  const isUserAdmin = useIsAdmin();

  // Permisos de administrador (todos los permisos)
  const adminPermissions = {
    can_create: true,
    can_read: true,
    can_update: true,
    can_delete: true
  };

  // Cargar permisos para una tabla específica
  useEffect(() => {
    // Si el usuario es administrador, no necesitamos cargar permisos
    if (isUserAdmin) {
      setPermissions(adminPermissions);
      setLoading(false);
      return;
    }

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
  }, [tableId, user?.id, isUserAdmin]);

  // Si el usuario es administrador, usar permisos de admin
  const effectivePermissions = isUserAdmin ? adminPermissions : permissions;

  // Función para verificar un permiso específico
  const hasPermission = (permission) => {
    return isUserAdmin || effectivePermissions[permission] || false;
  };

  // Función para verificar si tiene al menos un permiso
  const hasAnyPermission = () => {
    return isUserAdmin || Object.values(effectivePermissions).some(perm => perm);
  };

  // Función para verificar múltiples permisos
  const hasPermissions = (permissionList) => {
    return isUserAdmin || permissionList.every(perm => effectivePermissions[perm]);
  };

  // Función para obtener permisos de una tabla específica (cuando se cargan todos)
  const getTablePermissions = (tableId) => {
    // Si el usuario es administrador, devolver todos los permisos
    if (isUserAdmin) {
      return adminPermissions;
    }
    
    return allTablePermissions[tableId] || {
      can_create: false,
      can_read: false,
      can_update: false,
      can_delete: false
    };
  };

  return {
    permissions: effectivePermissions,
    allTablePermissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasPermissions,
    getTablePermissions,
    isAdmin: isUserAdmin,
    // Métodos de conveniencia
    canCreate: isUserAdmin || effectivePermissions.can_create,
    canRead: isUserAdmin || effectivePermissions.can_read,
    canUpdate: isUserAdmin || effectivePermissions.can_update,
    canDelete: isUserAdmin || effectivePermissions.can_delete,
  };
};

export default useUserPermissions;

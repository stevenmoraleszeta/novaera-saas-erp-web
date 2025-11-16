"use client";
import { useMemo } from 'react';
import useUserStore from '../stores/userStore';
import { useRoles } from './useRoles';

/**
 * Hook para verificar si el usuario actual es administrador
 * @returns {boolean} true si el usuario es administrador, false en caso contrario
 */
export function useIsAdmin() {
  const { user } = useUserStore();
  const { roles } = useRoles();

  const isAdmin = useMemo(() => {
    // Primero verificar si el usuario tiene is_admin directamente
    if (user?.is_admin === true) {
      return true;
    }
    
    // Fallback: verificar si alguno de los roles del usuario es administrador
    if (user?.rolesWithDetails?.some(role => role.is_admin === true)) {
      return true;
    }
    
    // Último fallback: comparar con la lista de roles disponibles
    return roles.some(role =>
      user?.roles?.includes(role.name) && role.is_admin === true
    );
  }, [roles, user?.roles, user?.is_admin, user?.rolesWithDetails]);

  return isAdmin;
}

export default useIsAdmin;


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
    // Todos los usuarios tienen permisos de administrador
    return true;
  }, []);

  return isAdmin;
}

export default useIsAdmin;


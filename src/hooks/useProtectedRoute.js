// useProtectedRoute.js
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { useState } from 'react';

/**
 * Redirige a login si no hay sesión válida. Muestra alerta si la sesión expiró.
 * @returns {Object} { expired: boolean }
 */
export function useProtectedRoute() {
  const { status, error } = useAuth();
  const router = useRouter();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setExpired(!!error);
      router.replace('/login');
    }
  }, [status, error, router]);

  return { expired };
}

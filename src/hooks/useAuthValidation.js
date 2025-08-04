import { useState, useEffect } from 'react';
import useUserStore from '../stores/userStore';
import { getUser } from '../services/authService';

export function useAuthValidation() {
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        // Si ya hay usuario en el store, verificar inmediatamente
        if (user) {
          console.log('useAuthValidation: User already in store:', user);
          setIsAuthenticated(true);
          setIsLoading(false);
          setHasCheckedAuth(true);
          return;
        }

        // Si no hay usuario, intentar obtenerlo del servidor
        console.log('useAuthValidation: No user in store, checking server...');
        const userData = await getUser();
        
        if (userData && (userData.user || userData.id)) {
          const userToSet = userData.user || userData;
          console.log('useAuthValidation: User authenticated from server:', userToSet);
          setUser(userToSet);
          setIsAuthenticated(true);
        } else {
          console.log('useAuthValidation: No user data from server');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('useAuthValidation: Auth check failed:', error.message);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        setHasCheckedAuth(true);
      }
    };

    // Timeout para evitar esperar indefinidamente
    const timeout = setTimeout(() => {
      if (!hasCheckedAuth) {
        console.log('useAuthValidation: Timeout reached, marking as not authenticated');
        setIsAuthenticated(false);
        setIsLoading(false);
        setHasCheckedAuth(true);
      }
    }, 4000); // 4 segundos de timeout

    validateAuth();

    return () => clearTimeout(timeout);
  }, [user, setUser, hasCheckedAuth]);

  return {
    isLoading,
    isAuthenticated,
    hasCheckedAuth,
    user
  };
}

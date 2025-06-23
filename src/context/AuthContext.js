'use client';

import { createContext, useState, useEffect, useCallback } from 'react';
import { setToken, removeToken } from '../lib/cookies';
import {
  login as loginService,
  register as registerService,
  getUser
} from '../services/authService';
import axios from '../lib/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | authenticated | unauthenticated | authenticating
  const [error, setError] = useState(null);

  const handleAuthError = (err, fallbackMessage) => {
    const message = err?.response?.data?.error || err?.message || fallbackMessage;
    setUser(null);
    setStatus('unauthenticated');
    setError(message);
    return false;
  };

  const refetchUser = useCallback(async () => {
    setStatus('authenticating');
    setError(null);
    try {
      const userData = await getUser();
      setUser(userData);
      setStatus('authenticated');
      return true;
    } catch (err) {
      return handleAuthError(err, 'Sesión expirada o inválida');
    }
  }, []);

  const login = async (email, password) => {
    setStatus('authenticating');
    setError(null);
    try {
      const response = await loginService(email, password);

      if (response?.user) {
        setUser(response.user);
        setStatus('authenticated');
        return true;
      }

      // fallback: reintentar obtener usuario si no viene incluido
      return await refetchUser();
    } catch (err) {
      return handleAuthError(err, 'Error de autenticación');
    }
  };

  const register = async (name, email, password) => {
    setStatus('registering');
    setError(null);
    try {
      return await registerService(name, email, password);
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Error de registro';
      setError(message);
      throw err;
    } finally {
      setStatus('unauthenticated');
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch {
      // Silenciar errores de logout
    }
    removeToken();
    setUser(null);
    setStatus('unauthenticated');
    if (typeof window !== 'undefined') {
      window.location.assign('/login');
    }
  };

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        error,
        login,
        register,
        logout,
        refetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

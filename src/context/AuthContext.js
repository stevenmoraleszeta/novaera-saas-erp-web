'use client';

import { createContext, useState, useEffect } from 'react';
import { getUserFromCookie } from '../lib/cookies';
import { login as loginService, getUser } from '../services/authService';
import axios from '../lib/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('authenticating');
  const [error, setError] = useState(null);

  // Refetch user from API (cookie-based)
  const refetchUser = async () => {
    setStatus('authenticating');
    setError(null);
    try {
      const userData = await getUser();
      setUser(userData);
      setStatus('authenticated');
    } catch (err) {
      setUser(null);
      setStatus('unauthenticated');
      setError(err?.response?.data?.error || 'Sesión expirada o inválida');
    }
  };

  // Login method
  const login = async (email, password) => {
    setStatus('authenticating');
    setError(null);
    try {
      const response = await loginService(email, password);

      // Si es un login demo, establecer cookie de demo
      if (response.user && !response.token) {
        // Login demo exitoso
        setUser(response.user);
        setStatus('authenticated');

        // Establecer cookie de demo para bypass del middleware
        if (typeof document !== 'undefined') {
          document.cookie = 'demo_mode=true; path=/; max-age=3600'; // 1 hora
        }

        return true;
      }

      // Login normal con backend
      await refetchUser();
      return true;
    } catch (err) {
      setUser(null);
      setStatus('unauthenticated');
      setError(err?.message || err?.response?.data?.error || 'Error de autenticación');
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch { }

    // Limpiar cookie de demo
    if (typeof document !== 'undefined') {
      document.cookie = 'demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    setUser(null);
    setStatus('unauthenticated');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    refetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, error, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

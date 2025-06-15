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
      await loginService(email, password);
      await refetchUser();
      return true;
    } catch (err) {
      setUser(null);
      setStatus('unauthenticated');
      setError(err?.response?.data?.error || 'Error de autenticación');
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch {}
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

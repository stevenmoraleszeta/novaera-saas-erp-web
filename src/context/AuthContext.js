'use client';

import { createContext, useState, useEffect } from 'react';
import { getUserFromCookie, setToken, removeToken } from '../lib/cookies';
import { login as loginService, getUser } from '../services/authService';
import axios from '../lib/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  // Refetch user from API (cookie-based)
  const refetchUser = async () => {
    console.log('AuthContext: refetchUser - Obteniendo usuario actual');
    setStatus('authenticating');
    setError(null);
    try {
      const userData = await getUser();
      console.log('AuthContext: Usuario obtenido:', userData);
      setUser(userData);
      setStatus('authenticated');
      return true;
    } catch (err) {
      console.error('AuthContext: Error al obtener usuario:', err);
      setUser(null);
      setStatus('unauthenticated');
      setError(err?.response?.data?.error || 'Sesión expirada o inválida');
      return false;
    }
  };

  // Login method
  const login = async (email, password) => {
    console.log('AuthContext: login - Iniciando proceso con email:', email);
    setStatus('authenticating');
    setError(null);
    try {
      console.log('AuthContext: Llamando a loginService');
      const response = await loginService(email, password);
      console.log('AuthContext: Respuesta de loginService:', response);

      // Verificar si la respuesta contiene un usuario
      if (response && response.user) {
        console.log('AuthContext: Usuario encontrado en respuesta');
        setUser(response.user);
        setStatus('authenticated');

        // Si estamos en modo demo, establecer cookie de demo
        if (!response.token) {
          console.log('AuthContext: No hay token, configurando modo demo');
          if (typeof document !== 'undefined') {
            document.cookie = 'demo_mode=true; path=/; max-age=3600'; // 1 hora
          }
        }

        return true;
      }

      // Si no hay usuario en la respuesta, intentar obtenerlo
      console.log('AuthContext: No hay usuario en respuesta, intentando refetchUser');
      return await refetchUser();
    } catch (err) {
      console.error('AuthContext: Error en login:', err);
      setUser(null);
      setStatus('unauthenticated');
      setError(err?.message || err?.response?.data?.error || 'Error de autenticación');
      return false;
    }
  };

  const logout = async () => {
    console.log('AuthContext: logout - Cerrando sesión');
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      console.warn('AuthContext: Error en logout (ignorado):', err);
    }

    // Limpiar cookies
    removeToken();
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
    console.log('AuthContext: useEffect - Verificando sesión inicial');
    // Intentar cargar usuario desde cookie primero
    const cookieUser = getUserFromCookie();
    if (cookieUser) {
      console.log('AuthContext: Usuario encontrado en cookie:', cookieUser);
      setUser(cookieUser);
      setStatus('authenticated');
    } else {
      console.log('AuthContext: No hay usuario en cookie, intentando refetchUser');
      refetchUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, error, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

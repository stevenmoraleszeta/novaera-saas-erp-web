// Utilidades para manejo de cookies
import Cookies from 'js-cookie';

export function setToken(token) {
  console.log('cookies.js: Guardando token en cookie');
  Cookies.set('token', token, { expires: 7 });
}

export function getToken() {
  const token = Cookies.get('token');
  console.log('cookies.js: Obteniendo token:', token ? 'Token encontrado' : 'No hay token');
  return token;
}

export function removeToken() {
  console.log('cookies.js: Eliminando token');
  Cookies.remove('token');
}

export function getUserFromCookie() {
  const token = getToken();
  if (!token) {
    console.log('cookies.js: No hay token en cookie');
    return null;
  }

  console.log('cookies.js: Verificando tipo de token');

  // Si tenemos un token demo, devolver información básica
  if (token === 'demo_token_admin') {
    console.log('cookies.js: Token demo de admin encontrado');
    return {
      id: 1,
      name: 'Admin Demo',
      email: 'admin@demo.com',
      role: 'admin'
    };
  } else if (token === 'demo_token_user') {
    console.log('cookies.js: Token demo de usuario encontrado');
    return {
      id: 2,
      name: 'Usuario Demo',
      email: 'user@demo.com',
      role: 'user'
    };
  }

  // Para tokens JWT reales, se podría decodificar aquí
  console.log('cookies.js: Token no reconocido o JWT real');
  return null;
}

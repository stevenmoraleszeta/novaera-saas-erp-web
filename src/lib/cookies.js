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

  // Si tenemos un token demo, no devolver información de usuario
  if (token === 'demo_token_admin' || token === 'demo_token_user') {
    console.log('cookies.js: Token demo encontrado, no se devolverá información de usuario');
    return null;
  }

  // Para tokens JWT reales, se podría decodificar aquí
  console.log('cookies.js: Token no reconocido o JWT real');
  return null;
}

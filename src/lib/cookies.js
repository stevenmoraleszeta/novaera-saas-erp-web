// Utilidades para manejo de cookies
import Cookies from 'js-cookie';

export function setToken(token) {
  Cookies.set('token', token, { expires: 7 });
}

export function getToken() {
  return Cookies.get('token');
}

export function removeToken() {
  Cookies.remove('token');
}

export function getUserFromCookie() {
  return null;
}

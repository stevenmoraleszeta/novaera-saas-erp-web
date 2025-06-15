// Servicio de autenticación de ejemplo
import axios from '../lib/axios';

export async function login(email, password) {
  const response = await axios.post('/auth/login', { email, password });
  return response.data;
}

export async function getUser() {
  const response = await axios.get('/auth/me');
  return response.data;
}

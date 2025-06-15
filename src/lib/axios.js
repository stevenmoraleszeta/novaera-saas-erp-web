// Configuración base de Axios
import axios from 'axios';
import { getToken } from './cookies';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true, 
});

instance.interceptors.request.use((config) => {
  return config;
});

export default instance;

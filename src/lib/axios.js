// Configuración base de Axios
import axios from 'axios';
import { getToken } from './cookies';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para agregar el token a las solicitudes
instance.interceptors.request.use((config) => {
  console.log(`axios.js: Enviando ${config.method.toUpperCase()} a ${config.url}`);

  const token = getToken();
  if (token) {
    console.log('axios.js: Agregando token a la solicitud');
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log('axios.js: No hay token disponible');
  }

  return config;
}, (error) => {
  console.error('axios.js: Error en interceptor de solicitud:', error);
  return Promise.reject(error);
});

// Interceptor para manejar errores de respuesta
instance.interceptors.response.use(
  (response) => {
    console.log(`axios.js: Respuesta exitosa de ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('axios.js: Error de respuesta:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('axios.js: No se recibió respuesta:', {
        url: error.config?.url,
        message: error.message
      });
    } else {
      console.error('axios.js: Error al configurar la solicitud:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;

// Configuración base de Axios
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  withCredentials: true,
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para agregar company_code en las cabeceras
instance.interceptors.request.use(
  (config) => {
    // Obtener company_code del localStorage si existe
    if (typeof window !== 'undefined') {
      try {
        const userStorage = localStorage.getItem('user-storage');
        if (userStorage) {
          const parsedStorage = JSON.parse(userStorage);
          const company = parsedStorage.state?.company;
          
          if (company?.company_code || company?.code) {
            config.headers['x-company-code'] = company.company_code || company.code;
          }
        }
      } catch (error) {
        console.warn('Error al obtener company_code del localStorage:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;

// Configuración base de Axios
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  withCredentials: true,
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para manejar errores de respuesta
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("Error de respuesta:", {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("No se recibió respuesta:", {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      console.error("Error al configurar la solicitud:", error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;

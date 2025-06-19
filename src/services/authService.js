// Servicio de autenticación 
import axios from '../lib/axios';
import { setToken } from '../lib/cookies';

export async function login(email, password) {
  console.log('authService.login: Intentando login con', { email });

  try {
    console.log('Enviando solicitud al backend...');
    const response = await axios.post('/auth/login', { email, password });
    console.log('Respuesta del backend:', response.data);

    if (response.data.token) {
      console.log('Token recibido, guardando...');
      setToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Error en el login:', error);
    throw error;
  }
}

export async function register(name, email, password) {
  console.log('authService.register: Intentando registrar usuario', { name, email });

  // Validar que los datos no sean undefined o null
  if (!name || !email || !password) {
    console.error('Error: Datos de registro incompletos');
    throw new Error('Todos los campos son obligatorios');
  }

  try {
    console.log('Enviando solicitud de registro al backend...');

    const userData = {
      name: String(name).trim(),
      email: String(email).trim(),
      password: String(password)
    };

    console.log('Datos de registro:', userData);

    // Intentar registrar el usuario
    const response = await axios.post('/auth/register', userData);
    console.log('Respuesta del backend:', response.data);

    if (response.data && response.data.message) {
      console.log('Mensaje de respuesta:', response.data.message);
    }

    return response.data;
  } catch (error) {
    console.error('Error en registro:', error);

    // Mostrar detalles del error para depuración
    if (error.response) {
      console.error('Respuesta de error del servidor:', {
        status: error.response.status,
        data: error.response.data
      });
    }

    // Si el backend no está disponible, usar modo demo
    if (!error.response) {
      console.warn('Backend not available, simulando registro demo:', error.message);

      // Simular registro fallido para emails ya registrados
      if (email === 'admin@demo.com' || email === 'user@demo.com') {
        console.error('Error: Email ya registrado en modo demo');
        throw new Error('El correo electrónico ya está registrado');
      }

      // Simular registro exitoso para otros emails
      console.log('Registro demo exitoso');
      return {
        success: true,
        message: 'Usuario registrado exitosamente con ID: 3',
        user: {
          id: 3,
          name,
          email,
          role: 'user'
        }
      };
    }

    // Re-lanzar el error para que sea manejado por el componente
    throw error;
  }
}

export async function getUser() {
  try {
    console.log('Obteniendo información del usuario desde el backend...');
    const response = await axios.get('/auth/me');
    console.log('Usuario obtenido:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el usuario:', error);

    // Elimina el fallback de usuario demo
    throw error;
  }
}

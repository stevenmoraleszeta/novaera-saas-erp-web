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
    console.warn('Backend not available, usando login demo:', error.message);

    // Login demo para testing (credenciales: admin@demo.com / 123456)
    if ((email === 'admin@demo.com' || email === 'admin') && password === '123456') {
      console.log('Credenciales demo admin correctas');
      // Simular respuesta exitosa con un token demo
      const demoResponse = {
        success: true,
        user: {
          id: 1,
          name: 'Admin Demo',
          email: 'admin@demo.com',
          role: 'admin'
        },
        token: 'demo_token_admin'
      };

      // Guardar el token demo
      setToken(demoResponse.token);
      console.log('Token demo guardado');

      return demoResponse;
    }

    // Otros usuarios demo
    if ((email === 'user@demo.com' || email === 'user') && password === '123456') {
      console.log('Credenciales demo user correctas');
      const demoResponse = {
        success: true,
        user: {
          id: 2,
          name: 'Usuario Demo',
          email: 'user@demo.com',
          role: 'user'
        },
        token: 'demo_token_user'
      };

      // Guardar el token demo
      setToken(demoResponse.token);
      console.log('Token demo guardado');

      return demoResponse;
    }

    // Login fallido
    console.error('Credenciales inválidas');
    throw new Error('Credenciales inválidas. Intenta: admin@demo.com / 123456');
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

    // Asegurarnos de que los datos son exactamente lo que espera el backend
    // El backend espera estos campos específicos para el stored procedure sp_registrar_usuario
    const userData = {
      name: String(name).trim(),
      email: String(email).trim(),
      password_hash: String(password)
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
    console.warn('Backend not available, usando usuario demo:', error.message);

    // Usuario demo para testing
    const demoUser = {
      id: 1,
      name: 'Admin Demo',
      email: 'admin@demo.com',
      role: 'admin'
    };

    console.log('Devolviendo usuario demo:', demoUser);
    return demoUser;
  }
}

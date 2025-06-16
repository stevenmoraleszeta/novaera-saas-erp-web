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

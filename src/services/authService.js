// Servicio de autenticación 
import axios from '../lib/axios';

export async function login(email, password) {
  try {
    const response = await axios.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.warn('Backend not available, using demo login:', error.message);

    // Login demo para testing (credenciales: admin@demo.com / 123456)
    if ((email === 'admin@demo.com' || email === 'admin') && password === '123456') {
      // Simular respuesta exitosa
      return {
        success: true,
        user: {
          id: 1,
          name: 'Admin Demo',
          email: 'admin@demo.com',
          role: 'admin'
        }
      };
    }

    // Otros usuarios demo
    if ((email === 'user@demo.com' || email === 'user') && password === '123456') {
      return {
        success: true,
        user: {
          id: 2,
          name: 'Usuario Demo',
          email: 'user@demo.com',
          role: 'user'
        }
      };
    }

    // Login fallido
    throw new Error('Credenciales inválidas. Intenta: admin@demo.com / 123456');
  }
}

export async function getUser() {
  try {
    const response = await axios.get('/auth/me');
    return response.data;
  } catch (error) {
    console.warn('Backend not available, using demo user:', error.message);

    // Usuario demo para testing
    return {
      id: 1,
      name: 'Admin Demo',
      email: 'admin@demo.com',
      role: 'admin'
    };
  }
}

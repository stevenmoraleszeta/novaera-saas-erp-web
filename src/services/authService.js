// Servicio de autenticación
import axios from "../lib/axios";

export async function login(email, password) {
  try {
    // Usar timeout más largo para login (puede tomar más tiempo si necesita crear usuario)
    const response = await axios.post("/auth/login", { email, password }, {
      timeout: 60000, // 60 segundos para login
    });
    return response.data;
  } catch (error) {
    console.error("🔐 AuthService: Login error:", error);
    // Mejorar mensaje de error para timeouts
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error("La operación está tomando más tiempo del esperado. Por favor, intenta nuevamente.");
    }
    throw error;
  }
}

export async function register(name, email, password) {
  // Validar que los datos no sean undefined o null
  if (!name || !email || !password) {
    throw new Error("Todos los campos son obligatorios");
  }

  try {
    const userData = {
      name: String(name).trim(),
      email: String(email).trim(),
      password: String(password),
    };

    // Usar timeout más largo para registro (puede tomar más tiempo en producción)
    const response = await axios.post("/auth/register", userData, {
      timeout: 60000, // 60 segundos para registro
    });
    return response.data;
  } catch (error) {
    console.error("Error en registro:", error);
    // Mejorar mensaje de error para timeouts
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error("La operación está tomando más tiempo del esperado. Por favor, intenta nuevamente.");
    }
    throw error;
  }
}

export async function getUser() {
  try {
    const response = await axios.get("/auth/me");
    return response.data;
  } catch (error) {
    // Don't log 401 errors as they're expected when user is not authenticated
    if (error?.response?.status !== 401) {
      console.error("AuthService: Error getting user:", error);
    }
    throw error;
  }
}

export async function getUserWithRoles() {
  try {
    const response = await axios.get("/auth/me");
    return response.data;
  } catch (error) {
    // Don't log 401 errors as they're expected when user is not authenticated
    if (error?.response?.status !== 401) {
      console.error("AuthService: Error getting user with roles:", error);
    }
    throw error;
  }
}

export async function logout() {
  try {
    const response = await axios.post("/auth/logout");
    return response.data;
  } catch (error) {
    console.error("Error en logout:", error);
    throw error;
  }
}

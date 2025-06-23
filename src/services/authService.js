// Servicio de autenticación
import axios from "../lib/axios";

export async function login(email, password) {
  try {
    const response = await axios.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Error en el login:", error);
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

    const response = await axios.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("Error en registro:", error);
    throw error;
  }
}

export async function getUser() {
  try {
    const response = await axios.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
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

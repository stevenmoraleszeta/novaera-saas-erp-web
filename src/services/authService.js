// Servicio de autenticación
import axios from "../lib/axios";

export async function login(email, password) {
  try {
    console.log("🔐 AuthService: Attempting login for:", email);
    const response = await axios.post("/auth/login", { email, password });
    console.log("🔐 AuthService: Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("🔐 AuthService: Login error:", error);
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
    console.log("🔐 AuthService: Getting user data...");
    const response = await axios.get("/auth/me");
    console.log("🔐 AuthService: Get user response:", response.data);
    return response.data;
  } catch (error) {
    console.error("🔐 AuthService: Get user error:", error);
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

// Servicio de autenticación
import axios from "../lib/axios";

export async function login(email, password, companyCode) {
  try {
    console.log("🔐 AuthService: Attempting login for:", email, "Company:", companyCode);
    const loginData = { email, password };
    
    // Agregar company_code si se proporciona
    if (companyCode) {
      loginData.company_code = companyCode;
    }
    
    const response = await axios.post("/auth/login", loginData);
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

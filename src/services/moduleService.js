import axios from "../lib/axios";

// Mapear datos del backend al formato del frontend
const mapModuleFromBackend = (backendModule) => {
  return {
    id: backendModule.id,
    name: backendModule.name,
    description: backendModule.description,
    iconUrl: backendModule.icon_url,
    createdBy: backendModule.created_by,
    createdAt: backendModule.created_at || backendModule.createdAt,
    ...backendModule,
  };
};

// Mapear datos del frontend al formato que espera el backend
const mapModuleToBackend = (frontendModule) => {
  return {
    name: frontendModule.name,
    description: frontendModule.description,
    icon_url: frontendModule.icon,
    created_by: frontendModule.createdBy,
  };
};

// Obtener todos los módulos
export async function getModules(params = {}) {
  try {
    const response = await axios.get("/modules");
    let modules = response.data.map(mapModuleFromBackend);

    // Filtros opcionales
    if (params.search) {
      const search = params.search.toLowerCase();
      modules = modules.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          (m.description && m.description.toLowerCase().includes(search))
      );
    }

    return {
      modules,
      total: modules.length,
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: modules.length,
    };
  } catch (error) {
    console.error("Error fetching modules, using db data:", error.message);
    if (
      error.response?.data?.error === "Token requerido" ||
      error.response?.status === 401
    ) {
      console.info("Backend requiere autenticación.");
    }
    throw error;
  }
}

// Obtener un módulo por ID
export async function getModuleById(id) {
  try {
    const response = await axios.get(`/modules/${id}`);
    return mapModuleFromBackend(response.data);
  } catch (error) {
    console.error("Error fetching module by ID:", error.message);
    throw error;
  }
}

// Crear un nuevo módulo
export async function createModule(data) {
  try {
    const payload = mapModuleToBackend(data);
    const response = await axios.post("/modules", payload);
    return mapModuleFromBackend(response.data);
  } catch (error) {
    console.error("Error creating module:", error.message);
    throw error;
  }
}

// Actualizar un módulo
export async function updateModule(id, data) {
  try {
    const payload = mapModuleToBackend(data);
    const response = await axios.put(`/modules/${id}`, payload);
    return mapModuleFromBackend(response.data);
  } catch (error) {
    console.error("Error updating module:", error.message);
    throw error;
  }
}

// Eliminar un módulo
export async function deleteModule(id) {
  try {
    const response = await axios.delete(`/modules/${id}`, {
      params: { cascada: true },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting module:", error.message);
    throw error;
  }
}
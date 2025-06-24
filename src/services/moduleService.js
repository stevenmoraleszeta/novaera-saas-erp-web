import axios from '../lib/axios';

// Mapear datos del backend al formato del frontend
const mapModuleFromBackend = (backendModule) => {
  return {
    id: backendModule.id,
    name: backendModule.name,
    description: backendModule.description,
    iconUrl: backendModule.icon_url,
    createdBy: backendModule.created_by,
    createdAt: backendModule.created_at || backendModule.createdAt,
    ...backendModule
  };
};

// Mapear datos del frontend al formato que espera el backend
const mapModuleToBackend = (frontendModule) => {
  return {
    name: frontendModule.name,
    description: frontendModule.description,
    icon_url: frontendModule.iconUrl,
    created_by: frontendModule.createdBy
  };
};

// Obtener todos los módulos
export async function getModules(params = {}) {
  try {
    const response = await axios.get('/modules');
    let modules = response.data.map(mapModuleFromBackend);

    // Filtros opcionales
    if (params.search) {
      const search = params.search.toLowerCase();
      modules = modules.filter(m =>
        m.name.toLowerCase().includes(search) ||
        (m.description && m.description.toLowerCase().includes(search))
      );
    }

    return {
      modules,
      total: modules.length,
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: modules.length
    };
  } catch (error) {
    console.error('Error fetching modules, using db data:', error.message);
    if (error.response?.data?.error === 'Token requerido' || error.response?.status === 401) {
      console.info('Backend requiere autenticación.');
    }

    const demoModules = [
      {
        id: 1,
        name: 'Inventario',
        description: 'Modulo para manejar inventarios',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 1,
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Compras',
        description: 'Modulo para manejar Compras',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 1,
        createdAt: '2024-01-16T14:20:00Z'
      },
      {
        id: 3,
        name: 'Recursos Humanos',
        description: 'Modulo para manejar Recursos Humanos',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 1,
        createdAt: '2024-01-17T09:15:00Z'
      },
      {
        id: 4,
        name: 'Horarios',
        description: 'Modulo para manejar Horarios',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 1,
        createdAt: '2024-01-18T16:45:00Z'
      },
      {
        id: 5,
        name: 'Facturas',
        description: 'Modulo para manejar Facturas',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 2,
        createdAt: '2024-01-19T11:30:00Z'
      },
      {
        id: 6,
        name: 'Facturas',
        description: 'Modulo para manejar Facturas',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 2,
        createdAt: '2024-01-19T11:30:00Z'
      },
      {
        id: 7,
        name: 'Facturas',
        description: 'Modulo para manejar Facturas',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 2,
        createdAt: '2024-01-19T11:30:00Z'
      },
      {
        id: 8,
        name: 'Facturas',
        description: 'Modulo para manejar Facturas',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 2,
        createdAt: '2024-01-19T11:30:00Z'
      },
      {
        id: 9,
        name: 'Facturas',
        description: 'Modulo para manejar Facturas',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 2,
        createdAt: '2024-01-19T11:30:00Z'
      },
      {
        id: 10,
        name: 'Facturas',
        description: 'Modulo para manejar Facturas',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 2,
        createdAt: '2024-01-19T11:30:00Z'
      },

    ];

    let modules = demoModules;

    // Filtros opcionales
    if (params.search) {
      const search = params.search.toLowerCase();
      modules = modules.filter(m =>
        m.name.toLowerCase().includes(search) ||
        (m.description && m.description.toLowerCase().includes(search))
      );
    }

    return {
      modules,
      total: modules.length,
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: modules.length
    };
    //throw error;

  }
}

// Obtener un módulo por ID
export async function getModuleById(id) {
  try {
    const response = await axios.get(`/modules/${id}`);
    return mapModuleFromBackend(response.data);
  } catch (error) {
    console.error('Error fetching module by ID:', error.message);
    const demoModules = [
      {
        id: 1,
        name: 'Inventario',
        description: 'Modulo para manejar inventarios',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 1,
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Compras',
        description: 'Modulo para manejar Compras',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 1,
        createdAt: '2024-01-16T14:20:00Z'
      },
      {
        id: 3,
        name: 'Recursos Humanos',
        description: 'Modulo para manejar Recursos Humanos',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 1,
        createdAt: '2024-01-17T09:15:00Z'
      },
      {
        id: 4,
        name: 'Horarios',
        description: 'Modulo para manejar Horarios',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 1,
        createdAt: '2024-01-18T16:45:00Z'
      },
      {
        id: 5,
        name: 'Facturas',
        description: 'Modulo para manejar Facturas',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 2,
        createdAt: '2024-01-19T11:30:00Z'
      },
      {
        id: 6,
        name: 'Facturas',
        description: 'Modulo para manejar Facturas',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 2,
        createdAt: '2024-01-19T11:30:00Z'
      },
      {
        id: 7,
        name: 'Facturas',
        description: 'Modulo para manejar Facturas',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 2,
        createdAt: '2024-01-19T11:30:00Z'
      },
      {
        id: 8,
        name: 'Facturas',
        description: 'Modulo para manejar Facturas',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 2,
        createdAt: '2024-01-19T11:30:00Z'
      },
      {
        id: 9,
        name: 'Facturas',
        description: 'Modulo para manejar Facturas',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 2,
        createdAt: '2024-01-19T11:30:00Z'
      },
      {
        id: 10,
        name: 'Facturas',
        description: 'Modulo para manejar Facturas',
        iconUrl: 'https://cdn-icons-png.flaticon.com/256/10996/10996252.png',
        createdBy: 2,
        createdAt: '2024-01-19T11:30:00Z'
      },

    ];

    const response = demoModules.find((modulo) => modulo.id === Number(id));
    return mapModuleFromBackend(response);

    //throw error;
  }
}

// Crear un nuevo módulo
export async function createModule(data) {
  try {
    console.log("creando: ", data);
    const payload = mapModuleToBackend(data);
    console.log("CREADOOOO: ", payload);
    const response = await axios.post('/modules', payload);
    console.log("lo logrooo : ", response);
    return mapModuleFromBackend(response.data);
  } catch (error) {
    console.error('Error creating module:', error.message);
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
    console.error('Error updating module:', error.message);
    throw error;
  }
}

// Eliminar un módulo
export async function deleteModule(id) {
  try {
    console.log("EL MERO IDDD, ", id);
    const response = await axios.delete(`/modules/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting module:', error.message);
    throw error;
  }
}

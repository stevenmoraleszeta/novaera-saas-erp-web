const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const columnOptionsService = {
  // Crear/actualizar opciones personalizadas para una columna
  async createColumnOptions(columnId, options) {
    const response = await fetch(`${API_BASE_URL}/columns/${columnId}/options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ options }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  // Obtener opciones personalizadas de una columna
  async getColumnOptions(columnId) {
    const response = await fetch(`${API_BASE_URL}/columns/${columnId}/options`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  // Obtener todas las opciones disponibles para una columna (personalizadas o de tabla)
  async getAvailableOptions(columnId) {
    const response = await fetch(`${API_BASE_URL}/columns/${columnId}/available-options`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  // Actualizar una opción específica
  async updateColumnOption(optionId, optionData) {
    const response = await fetch(`${API_BASE_URL}/options/${optionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(optionData),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  // Eliminar una opción específica
  async deleteColumnOption(optionId) {
    const response = await fetch(`${API_BASE_URL}/options/${optionId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  // Eliminar todas las opciones de una columna
  async deleteColumnOptions(columnId) {
    const response = await fetch(`${API_BASE_URL}/columns/${columnId}/options`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },
};

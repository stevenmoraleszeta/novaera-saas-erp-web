import axios from "../lib/axios";

// Mapeo del backend al frontend
const mapViewFromBackend = (backendView) => ({
  id: backendView.id,
  tableId: backendView.table_id,
  name: backendView.name,
  sortBy: backendView.sort_by,
  sortDirection: backendView.sort_direction,
  columns: backendView.columns || [], // esto puede llenarse aparte
});

// Mapeo del frontend al backend
const mapViewToBackend = (frontendView) => ({
  table_id: frontendView.tableId,
  name: frontendView.name,
  sort_by: frontendView.sortBy,
  sort_direction: frontendView.sortDirection,
});

// Crear una vista
export async function createView(viewData) {
  const payload = mapViewToBackend(viewData);
  const response = await axios.post("/views", payload);
  return mapViewFromBackend(response.data);
}

// Obtener vistas de una tabla (usando query param)
export async function getViewsByTable(tableId) {
  const response = await axios.get(`/views`, {
    params: { table_id: tableId },
  });
  return response.data.map(mapViewFromBackend);
}

// Obtener columnas de una vista
export async function getColumnsByView(viewId) {
  const response = await axios.get(`/views/columns`, {
    params: { view_id: viewId },
  });
  return response.data;
}

// Agregar columna a una vista
export async function addColumnToView(viewColumnData) {
  const response = await axios.post(`/views/columns`, viewColumnData);
  return response.data;
}

// Eliminar una vista por ID
export async function deleteView(viewId) {
  const response = await axios.delete(`/views/${viewId}`);
  return response.data;
}

// Actualizar vista
export async function updateView(id, updatedData) {
  const payload = mapViewToBackend(updatedData);
  const response = await axios.put(`/views/${id}`, payload);
  return mapViewFromBackend(response.data);
}

// Actualizar columna de vista
export async function updateViewColumn(id, updatedData) {
  const response = await axios.put(`/views/columns/${id}`, updatedData);
  return response.data;
}

// Eliminar columna de vista
export async function deleteViewColumn(id) {
  const response = await axios.delete(`/views/columns/${id}`);
  return response.data;
}

import axios from "../lib/axios";

// Mapear del backend al frontend
const mapViewSortFromBackend = (backendSort) => ({
  id: backendSort.id,
  viewId: backendSort.view_id,
  columnId: backendSort.column_id,
  direction: backendSort.direction,
  position: backendSort.position,
  createdAt: backendSort.created_at,
  ...backendSort,
});

// Mapear del frontend al backend
const mapViewSortToBackend = (frontendSort) => ({
  view_id: frontendSort.viewId,
  column_id: frontendSort.columnId,
  direction: frontendSort.direction,
  position: frontendSort.position,
});

// Obtener todos los ordenamientos de una vista
export async function getViewSortsByViewId(viewId) {
  try {
    const res = await axios.get(`/view-sorts/by-view/${viewId}`);
    return res.data.map(mapViewSortFromBackend);
  } catch (err) {
    console.error("Error fetching view sorts:", err);
    throw err;
  }
}

// Crear un nuevo ordenamiento
export async function createViewSort(sortData) {
  try {
    const payload = mapViewSortToBackend(sortData);
    const res = await axios.post(`/view-sorts`, payload);
    return mapViewSortFromBackend(res.data);
  } catch (err) {
    const payload = mapViewSortToBackend(sortData);
    console.error("Error creating view sort:", err);
    throw err;
  }
}

// Actualizar un ordenamiento existente
export async function updateViewSort(id, sortData) {
  try {
    const payload = mapViewSortToBackend(sortData);
    const res = await axios.put(`/view-sorts/${id}`, payload);
    return mapViewSortFromBackend(res.data);
  } catch (err) {
    console.error("Error updating view sort:", err);
    throw err;
  }
}

// Eliminar un ordenamiento
export async function deleteViewSort(id) {
  try {
    const res = await axios.delete(`/view-sorts/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting view sort:", err);
    throw err;
  }
}

// Cambiar la posición de un ordenamiento
export async function updateViewSortPosition(id, newPosition) {
  try {
    const res = await axios.patch(`/view-sorts/${id}/update_position`, {
      position: newPosition,
    });
    return res.data;
  } catch (err) {
    console.error("Error updating sort position:", err);
    throw err;
  }
}

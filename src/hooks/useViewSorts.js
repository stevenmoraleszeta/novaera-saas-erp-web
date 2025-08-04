import { useState, useEffect, useCallback } from "react";
import {
  getViewSortsByViewId,
  createViewSort,
  updateViewSort,
  deleteViewSort,
  updateViewSortPosition,
} from "@/services/viewSortService";
import useUserStore from "@/stores/userStore";

export function useViewSorts(viewId) {
  const [sorts, setSorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { user } = useUserStore();

  // Cargar los ordenamientos de la vista
  const loadViewSorts = useCallback(async () => {
    // Only load view sorts if user is authenticated and viewId is provided
    if (!viewId || !user) {
      console.log('useViewSorts: User not authenticated or no viewId, skipping view sorts load');
      return;
    }

    setLoading(true);
    try {
      const result = await getViewSortsByViewId(viewId);
      setSorts(result.sort((a, b) => a.position - b.position));
    } catch (err) {
      console.error("Error loading view sorts:", err);
      setError("Error al cargar los ordenamientos");
    } finally {
      setLoading(false);
    }
  }, [viewId, user]);

  useEffect(() => {
    // Only load view sorts if user is authenticated
    if (user) {
      loadViewSorts();
    }
  }, [loadViewSorts, user]);

  // Crear nuevo ordenamiento
  const handleCreateSort = async (sortData) => {
    try {
      const newSort = await createViewSort({ ...sortData, viewId });
      await loadViewSorts();
      return newSort;
    } catch (err) {
      console.error("Error creando ordenamiento:", err);
      setError("Error al crear ordenamiento");
    }
  };

  // Actualizar ordenamiento existente
  const handleUpdateSort = async (id, updatedData) => {
    try {
      const updated = await updateViewSort(id, updatedData);
      await loadViewSorts();
      return updated;
    } catch (err) {
      console.error("Error actualizando ordenamiento:", err);
      setError("Error al actualizar ordenamiento");
    }
  };

  // Eliminar ordenamiento
  const handleDeleteSort = async (id) => {
    try {
      await deleteViewSort(id);
      await loadViewSorts();
    } catch (err) {
      console.error("Error eliminando ordenamiento:", err);
      setError("Error al eliminar ordenamiento");
    }
  };

  // Reordenar un ordenamiento (cambiar posición)
  const handleUpdateSortPosition = async (id, newPosition) => {
    try {
      await updateViewSortPosition(id, newPosition);
      await loadViewSorts();
    } catch (err) {
      console.error("Error actualizando posición del ordenamiento:", err);
      setError("Error al cambiar la prioridad del ordenamiento");
    }
  };

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    sorts,
    loading,
    error,
    success,
    loadViewSorts,
    handleCreateSort,
    handleUpdateSort,
    handleDeleteSort,
    handleUpdateSortPosition,
    clearMessages,
  };
}

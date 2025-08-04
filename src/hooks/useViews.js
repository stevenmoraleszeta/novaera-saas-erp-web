import { useState, useEffect, useCallback } from "react";
import {
  getViewsByTable,
  createView,
  updateView,
  deleteView,
  addColumnToView,
  getColumnsByView,
  updateViewColumn,
  deleteViewColumn,
  updateViewPosition,
  updateViewColumnPosition
} from "@/services/viewsService";
import useUserStore from "@/stores/userStore";

export function useViews(tableId) {
  const [views, setViews] = useState([]);
  const [columns, setColumns] = useState({}); // Changed to object to store columns per view
  const [loadingViews, setLoadingViews] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { user } = useUserStore();

  // Auto-load views when tableId changes
  useEffect(() => {
    // Only load views if user is authenticated and tableId is provided
    if (tableId && user) {
      loadViews();
    }
  }, [tableId, user]);

  // Cargar vistas de una tabla
  const loadViews = useCallback(async () => {
    // Only load views if user is authenticated
    if (!tableId || !user) {
      console.log('useViews: User not authenticated or no tableId, skipping views load');
      return;
    }

    setLoadingViews(true);
    setError(null);
    try {
      const data = await getViewsByTable(tableId);
      setViews(data);
    } catch (err) {
      setError(err.message || "Error loading views");
    } finally {
      setLoadingViews(false);
    }
  }, [tableId, user]);

  // Cargar columnas de una vista
  const loadColumns = useCallback(async (viewId) => {
    // Only load columns if user is authenticated
    if (!viewId || !user) {
      console.log('useViews: User not authenticated or no viewId, skipping columns load');
      return [];
    }

    setLoadingColumns(true);
    setError(null);
    try {
      const data = await getColumnsByView(viewId);
      setColumns((prev) => ({ ...prev, [viewId]: data }));
      return data; // <-- devuélvelo
    } catch (err) {
      setError(err.message || "Error loading columns");
      return [];
    } finally {
      setLoadingColumns(false);
    }
  }, [user]);

  // Get columns for a specific view
  const getColumnsForView = useCallback(
    async (viewId) => {
      try {
        const data = await getColumnsByView(viewId);
        return data;
      } catch (err) {
        console.error("Error al obtener columnas para la vista:", err);
        return [];
      }
    },
    []
  );
  // Crear una nueva vista
  const handleCreateView = useCallback(
    async (viewData) => {
      try {
        const newView = await createView(viewData);
        await loadViews();
        return newView;
      } catch (err) {
        setError(err.message || "Error creating view");
        throw err;
      }
    },
    [loadViews]
  );

  // Actualizar vista
  const handleUpdateView = useCallback(
    async (id, updatedData) => {
      try {
        const updatedView = await updateView(id, updatedData);
        await loadViews();
        return updatedView;
      } catch (err) {
        setError(err.message || "Error updating view");
        throw err;
      }
    },
    [loadViews]
  );

  // Eliminar vista
  const handleDeleteView = useCallback(
    async (id) => {
      try {
        await deleteView(id);
        await loadViews();
        // Remove columns for deleted view
        setColumns((prev) => {
          const newColumns = { ...prev };
          delete newColumns[id];
          return newColumns;
        });
      } catch (err) {
        setError(err.message || "Error deleting view");
        throw err;
      }
    },
    [loadViews]
  );

  // Agregar columna a vista
  const handleAddColumnToView = useCallback(
    async (columnData) => {
      try {
        const newColumn = await addColumnToView(columnData);
        if (columnData.view_id) {
          await loadColumns(columnData.view_id);
        }
        return newColumn;
      } catch (err) {
        setError(err.message || "Error adding column to view");
        throw err;
      }
    },
    [loadColumns]
  );

  // Actualizar columna de vista
  const handleUpdateViewColumn = useCallback(
    async (id, updatedData) => {
      try {
        const updatedColumn = await updateViewColumn(id, updatedData);
        if (updatedData.view_id) {
          await loadColumns(updatedData.view_id);
        }
        return updatedColumn;
      } catch (err) {
        setError(err.message || "Error updating view column");
        throw err;
      }
    },
    [loadColumns]
  );

  // Eliminar columna de vista
  const handleDeleteViewColumn = useCallback(
    async (id, viewId) => {
      try {
        await deleteViewColumn(id);
        if (viewId) {
          await loadColumns(viewId);
        }
      } catch (err) {
        setError(err.message || "Error deleting view column");
        throw err;
      }
    },
    [loadColumns]
  );

  const handleUpdatePosition = async (viewId, newPosition) => {
    try {
      setError(null);
      setSuccess(null);
      await updateViewPosition(viewId, newPosition);
      setSuccess('Posición actualizada correctamente');
    } catch (err) {
      console.error('Error actualizando posición:', err);
      setError(err?.response?.data?.error || 'Error al actualizar la posición');
    }
  };

  const handleUpdateViewColumnPosition = async (viewId, newPosition) => {
    try {
      setError(null);
      setSuccess(null);
      await updateViewColumnPosition(viewId, newPosition);
      setSuccess('Posición actualizada correctamente');
    } catch (err) {
      console.error('Error actualizando posición:', err);
      setError(err?.response?.data?.error || 'Error al actualizar la posición');
    }
  };

  return {
    views,
    columns,
    loadingViews,
    loadingColumns,
    error,
    loadViews,
    loadColumns,
    getColumnsForView,
    handleCreateView,
    handleUpdateView,
    handleDeleteView,
    handleAddColumnToView,
    handleUpdateViewColumn,
    handleDeleteViewColumn,
    handleUpdatePosition,
    handleUpdateViewColumnPosition
  };
}

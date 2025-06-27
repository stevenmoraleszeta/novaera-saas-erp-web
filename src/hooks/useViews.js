import { useState, useEffect, useCallback } from "react";
import {
  getViewsByTable,
  createView,
  updateView,
  deleteView,
  addColumnToView,
  getColumnsByView,
  updateViewColumn,
} from "@/services/viewsService";

export function useViews(tableId) {
  const [views, setViews] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loadingViews, setLoadingViews] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [error, setError] = useState(null);

  // Cargar vistas de una tabla
  const loadViews = useCallback(async () => {
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
  }, [tableId]);

  // Cargar columnas de una vista
  const loadColumns = useCallback(async (viewId) => {
    setLoadingColumns(true);
    setError(null);
    try {
      const data = await getColumnsByView(viewId);
      setColumns(data);
    } catch (err) {
      setError(err.message || "Error loading columns");
    } finally {
      setLoadingColumns(false);
    }
  }, []);

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

  return {
    views,
    columns,
    loadingViews,
    loadingColumns,
    error,
    loadViews,
    loadColumns,
    handleCreateView,
    handleUpdateView,
    handleDeleteView,
    handleAddColumnToView,
    handleUpdateViewColumn,
  };
}

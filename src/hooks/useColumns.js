import { useState, useEffect, useCallback } from 'react';
import {
  getColumnsByTable,
  createColumn,
  updateColumn,
  deleteColumn,
  checkColumnNameExists,
  checkColumnHasRecords,
  updateColumnPosition
} from '@/services/columnsService';

export function useColumns(tableId) {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');

  const fetchColumns = useCallback(async () => {
    if (!tableId) return;
    setLoading(true);
    try {
      const response = await getColumnsByTable(tableId);
      const filtered = search
        ? response.filter(col =>
            col.name.toLowerCase().includes(search.toLowerCase())
          )
        : response;

      setColumns(filtered);
    } catch (err) {
      console.error('Error fetching columns:', err);
      setError(err?.response?.data?.error || 'Error al cargar columnas');
    } finally {
      setLoading(false);
    }
  }, [tableId, search]);

  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

  const handleCreate = async (columnData) => {
    try {
      setError(null);
      await createColumn(columnData);
      setSuccess('Columna creada');
      fetchColumns();
    } catch (err) {
      console.error('Error creating column:', err);
      setError(err?.response?.data?.error || 'Error al crear columna');
    }
  };

  const handleUpdate = async (columnId, columnData) => {
    try {
      setError(null);
      await updateColumn(columnId, columnData);
      setSuccess('Columna actualizada');
      fetchColumns();
    } catch (err) {
      console.error('Error updating column:', err);
      setError(err?.response?.data?.error || 'Error al actualizar columna');
    }
  };

  const handleDelete = async (columnId) => {
    try {
      await deleteColumn(columnId);
      setSuccess('Columna eliminada');
      fetchColumns();
    } catch (err) {
      console.error('Error deleting column:', err);
      setError(err?.response?.data?.error || 'Error al eliminar columna');
    }
  };

  const handleSearch = (query) => {
    setSearch(query);
  };

  const validateNameExists = async (name) => {
    try {
      return await checkColumnNameExists(tableId, name);
    } catch (err) {
      console.error('Error validating column name:', err);
      return false;
    }
  };

  const validateHasRecords = async (columnId) => {
    try {
      return await checkColumnHasRecords(columnId);
    } catch (err) {
      console.error('Error validating column records:', err);
      return false;
    }
  };
      const handleUpdatePosition = async (columnId, newPosition) => {
      try {
        setError(null);
        setSuccess(null);
        console.log('NEWPO, ', newPosition );
        await updateColumnPosition(columnId, newPosition);
        setSuccess('Posición actualizada correctamente');
        fetchColumns(); // O lo que uses para recargar la lista
      } catch (err) {
        console.error('Error actualizando posición:', err);
        setError(err?.response?.data?.error || 'Error al actualizar la posición');
      }
    };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    columns,
    loading,
    error,
    success,
    fetchColumns,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSearch,
    validateNameExists,
    validateHasRecords,
    clearMessages,
    handleUpdatePosition,
  };
}

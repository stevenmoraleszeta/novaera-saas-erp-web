import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  getModuleById
} from '@/services/moduleService';

function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export function useModules(initialParams = {}) {
  const [modules, setModules] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const debouncedSearch = useDebounce(search);

  // Use a ref to avoid stale closure on currentPage/itemsPerPage/debouncedSearch
  const paramsRef = useRef({ currentPage, itemsPerPage, debouncedSearch });
  useEffect(() => {
    paramsRef.current = { currentPage, itemsPerPage, debouncedSearch };
  }, [currentPage, itemsPerPage, debouncedSearch]);

  const loadModules = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await getModules({
        page: params.page || paramsRef.current.currentPage,
        limit: params.limit || paramsRef.current.itemsPerPage,
        search: params.search !== undefined ? params.search : paramsRef.current.debouncedSearch
      });

      setModules(response.modules);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
      setItemsPerPage(response.itemsPerPage);
    } catch (err) {
      console.error('Failed to load modules:', err);
      setError(err.message || 'Error loading modules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModules({ search: debouncedSearch, page: currentPage, limit: itemsPerPage });
  }, [debouncedSearch, currentPage, itemsPerPage, loadModules]);

  const handleSearch = useCallback((query) => {
    setSearch(query);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleCreateModule = useCallback(async (data) => {
    const newModule = await createModule(data);
    await loadModules();
    return newModule;
  }, [loadModules]);

  const handleUpdateModule = useCallback(async (id, data) => {
    const updatedModule = await updateModule(id, data);
    await loadModules();
    return updatedModule;
  }, [loadModules]);

  const handleDeleteModule = useCallback(async (id) => {
    try {
      setError(null);
      await deleteModule(id);
      setSuccess('Módulo eliminado correctamente');
      await loadModules();
    } catch (err) {
      console.error('Error deleting module:', err);
      setError(err?.response?.data?.error || 'Error al eliminar el módulo');
    }
  }, [loadModules]);

  const getById = useCallback(async (id) => {
    try {
      setError(null);
      const module = await getModuleById(id);
      return module;
    } catch (err) {
      console.error('Error getting Module by ID:', err);
      setError(err?.response?.data?.error || 'Error al obtener el módulo');
      throw err;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    modules,
    total,
    totalPages,
    currentPage,
    itemsPerPage,
    loading,
    error,
    success,
    searchQuery: search,
    handleSearch,
    handlePageChange,
    loadModules,
    handleCreateModule,
    handleUpdateModule,
    handleDeleteModule,
    getById,
    clearMessages
  };
}

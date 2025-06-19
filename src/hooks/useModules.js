import { useState, useEffect, useCallback } from 'react';
import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  getModuleById
} from '@/services/moduleService';

export function useModules(initialParams = {}) {
  const [modules, setModules] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [succes, setSucces] = useState(null);

  const loadModules = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await getModules({
        page: params.page || currentPage,
        limit: params.limit || itemsPerPage,
        search: params.search !== undefined ? params.search : search
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
  }, [currentPage, itemsPerPage, search]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

      // Handle search
  const handleSearch = useCallback((query) => {
        setSearch(query);
        setCurrentPage(1);
        loadModules({ search: query, page: 1 });
    }, []);


  const handleSearch2 = (term) => {
    setSearch(term);
    setCurrentPage(1);
    loadModules({ search: term, page: 1 });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadModules({ page });
  };

  const handleCreateModule = async (data) => {
    const newModule = await createModule(data);
    loadModules();
    return newModule;
  };

  const handleUpdateModule = async (id, data) => {
    const updatedModule = await updateModule(id, data);
    loadModules();
    return updatedModule;
  };

  const handleDeleteModule = async (id) => {
    await deleteModule(id);
    loadModules();
  };

  const getById = async (id) => {
    return await getModuleById(id);
  };

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
    searchQuery : search,
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

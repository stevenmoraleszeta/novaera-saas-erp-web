import { useState, useEffect, useCallback } from "react";
import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  getModuleById,
  updateModulePosition,
} from "@/services/moduleService";
import { useLogicalTables } from "@/hooks/useLogicalTables";
import { useColumns } from "@/hooks/useColumns";
import useUserStore from "@/stores/userStore";

export function useModules(initialParams = {}) {
  const [modules, setModules] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { user } = useUserStore();


  const {
    createOrUpdateTable
  } = useLogicalTables();
  const {
    handleCreate
  } = useColumns();

  const loadModules = useCallback(
    async (params = {}) => {
      // Only load modules if user is authenticated
      if (!user) {
        console.log("useModules: User not authenticated, skipping module load");
        return;
      }

      setLoading(true);
      try {
        const response = await getModules({
          page: params.page || currentPage,
          limit: params.limit || itemsPerPage,
          search: params.search !== undefined ? params.search : search,
        });

        setModules(response.modules);
        setTotal(response.total);
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
        setItemsPerPage(response.itemsPerPage);
      } catch (err) {
        console.error("Failed to load modules:", err);
        setError(err.message || "Error loading modules");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage, search, user]
  );

  useEffect(() => {
    // Only load modules if user is authenticated
    if (user) {
      loadModules();
    }
  }, [loadModules, user]);

  const handleSearch = useCallback((query) => {
    setSearch(query);
    setCurrentPage(1);
    loadModules({ search: query, page: 1 });
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadModules({ page });
  };

  const handleCreateModule = async (data) => {
    try {
      const newModule = await createModule(data);

      const datatable = await createOrUpdateTable({
        name: data.name,
        description: data.description,
        module_id: newModule.message.module_id,
      });

      const datacolumn = await handleCreate({
        name: "Nombre",
        data_type: "string",
        is_required: false,
        is_unique: false,
        is_foreign_key: false,
        relation_type: "",
        foreign_table_id: null,
        foreign_column_name: "",
        foreign_column_id: "",
        validations: "",
        table_id: datatable,
        created_by: user?.id || null,
        column_position: 0,
      })


      await loadModules();
      return newModule;

    } catch (error) {
      console.error(" Error en handleCreateModule:", error);
    }
  };

  const handleUpdateModule = async (id, data) => {
    const updatedModule = await updateModule(id, data);
    loadModules();
    return updatedModule;
  };

  const handleDeleteModule = useCallback(async (id, cascada = true) => {
    try {
      setError(null);
      await deleteModule(id, cascada);
      setSuccess("Modulo eliminado correctamente");
      loadModules();
    } catch (err) {
      console.error("Error deleting module:", err);
      setError(err?.response?.data?.error || "Error al eliminar el módulo");
    }
  }, []);

  // Get user by ID
  const getById = useCallback(async (id) => {
    try {
      setError(null);
      const module = await getModuleById(id);
      console.log("Module retrieved by ID:", module);
      return module;
    } catch (err) {
      console.error("Error getting Module by ID:", err);
      setError(err?.response?.data?.error || "Error al obtener el usuario");
      throw err;
    }
  }, []);

  const handleUpdatePosition = async (id, newPosition) => {
    try {
      setError(null);
      setSuccess(null);
      console.log('chat: NEWPO, ', id, newPosition);
      await updateModulePosition(id, newPosition);
      setSuccess('Posición actualizada correctamente');
      loadModules();
    } catch (err) {
      console.error('Error actualizando posición:', err);
      setError(err?.response?.data?.error || 'Error al actualizar la posición');
    }
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
    searchQuery: search,
    handleSearch,
    handlePageChange,
    loadModules,
    handleCreateModule,
    handleUpdateModule,
    handleDeleteModule,
    getById,
    clearMessages,
    handleUpdatePosition,
  };
}

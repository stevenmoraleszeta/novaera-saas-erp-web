import { useCallback } from "react";
import axios from "@/lib/axios";

export function useLogicalTables(moduleId) {
  // Obtener todas las tablas lógicas del módulo
  const getAllTables = useCallback(async () => {
    const res = await axios.get(`/tables/module/${moduleId}`);
    return res.data;
  }, [moduleId]);

  // Obtener una tabla lógica por ID
  const getTableById = useCallback(async (id) => {
    const res = await axios.get(`/tables/${id}`);
    return res.data;
  }, []);

  // Crear o actualizar una tabla lógica
  const createOrUpdateTable = useCallback(
    async (data) => {
      if (data.id) {
        // Actualizar
        const res = await axios.put(`/tables/${data.id}`, data);
        return res.data;
      } else {
        // Crear
        const res = await axios.post(`/tables`, { ...data, moduleId });
        return res.data;
      }
    },
    [moduleId]
  );

  // Eliminar una tabla lógica
  const deleteTable = useCallback(async (id) => {
    const res = await axios.delete(`/tables/${id}`);
    return res.data;
  }, []);

  return { getAllTables, getTableById, createOrUpdateTable, deleteTable };
}

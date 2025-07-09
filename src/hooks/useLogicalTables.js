import { useState, useEffect, useCallback } from 'react';;
import axios from "@/lib/axios";

import {
  updateTablePosition,
} from '@/services/tablesService';

import {
  updateRecordPosition
} from '@/services/logicalTableService';

export function useLogicalTables(moduleId) {

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
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

  
    const handleUpdatePosition = async (tableID, newPosition) => {
      try {
        setError(null);
        setSuccess(null);
        console.log('NEWPO, ', newPosition );
        await updateTablePosition(tableID, newPosition);
        setSuccess('Posición actualizada correctamente');
        getAllTables(); // O lo que uses para recargar la lista
      } catch (err) {
        console.error('Error actualizando posición:', err);
        setError(err?.response?.data?.error || 'Error al actualizar la posición');
      }
  };

      const handleUpdatePositionRecord = async (recordId, newPosition) => {
        try {
          setError(null);
          setSuccess(null);
          console.log('chat: NEWPO, ', recordId, newPosition );
          await updateRecordPosition(recordId, newPosition);
          setSuccess('Posición actualizada correctamente');
        } catch (err) {
          console.error('Error actualizando posición:', err);
          setError(err?.response?.data?.error || 'Error al actualizar la posición');
        }
      };

  

  return { getAllTables, getTableById, createOrUpdateTable, deleteTable, handleUpdatePosition, handleUpdatePositionRecord };
}


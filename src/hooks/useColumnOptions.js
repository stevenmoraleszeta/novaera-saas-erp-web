import { useState, useEffect } from 'react';
import { columnOptionsService } from '@/services/columnOptionsService';

export const useColumnOptions = (columnId) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOptions = async () => {
    if (!columnId || columnId === null || columnId === undefined) {
      setOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await columnOptionsService.getAvailableOptions(columnId);
      
      if (response.success) {
        const options = response.options || [];
        setOptions(options);
      } else {
        setError(response.message || 'Error al cargar opciones');
        setOptions([]);
      }
    } catch (err) {
      console.error(`useColumnOptions: Error fetching options for column ${columnId}:`, err);
      setError('Error al cargar opciones');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [columnId]);

  return {
    options,
    loading,
    error,
    refetch: fetchOptions
  };
};

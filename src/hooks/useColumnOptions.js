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
      console.log('Options received for column', columnId, ':', response);
      if (response.success) {
        setOptions(response.options || []);
      } else {
        setError(response.message || 'Error al cargar opciones');
        setOptions([]);
      }
    } catch (err) {
      console.error('Error fetching column options:', err);
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

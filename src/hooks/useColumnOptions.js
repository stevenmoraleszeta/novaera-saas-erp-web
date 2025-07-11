import { useState, useEffect } from 'react';
import { columnOptionsService } from '@/services/columnOptionsService';

export const useColumnOptions = (columnId) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOptions = async () => {
    if (!columnId || columnId === null || columnId === undefined) {
      console.log('useColumnOptions: No columnId provided');
      setOptions([]);
      setLoading(false);
      return;
    }

    console.log(`useColumnOptions: Fetching options for column ${columnId}`);
    setLoading(true);
    setError(null);

    try {
      const response = await columnOptionsService.getAvailableOptions(columnId);
      console.log(`useColumnOptions: Response for column ${columnId}:`, response);
      
      if (response.success) {
        const options = response.options || [];
        console.log(`useColumnOptions: Setting ${options.length} options for column ${columnId}:`, options);
        setOptions(options);
      } else {
        console.warn(`useColumnOptions: Response not successful for column ${columnId}:`, response.message);
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

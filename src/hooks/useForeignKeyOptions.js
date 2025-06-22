import { useEffect, useState } from 'react';
import { getTables } from '@/services/tablesService';
import { getColumnsByTable } from '@/services/columnsService';

export function useForeignKeyOptions() {
  const [tables, setTables] = useState([]);
  const [columnsByTable, setColumnsByTable] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTablesAndColumns = async () => {
      setLoading(true);
      try {
        const tablesData = await getTables();
        setTables(tablesData);

        const columnsData = {};

        // Usar Promise.all para acelerar la carga
        await Promise.all(
          tablesData.map(async (table) => {
            const cols = await getColumnsByTable(table.id);
            columnsData[table.id] = cols;
          })
        );

        setColumnsByTable(columnsData);
      } catch (err) {
        console.error('Error al obtener tablas y columnas:', err);
        setError('Error al cargar tablas/columnas');
      } finally {
        setLoading(false);
      }
    };

    fetchTablesAndColumns();
  }, []);

  return { tables, columnsByTable, loading, error };
}

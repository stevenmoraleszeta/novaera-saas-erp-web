import axios from '../lib/axios';

// Mapear del backend al frontend
const mapColumnFromBackend = (c) => ({
  id: c.column_id,
  tableId: c.table_id,
  name: c.name,
  type: c.type,
  nullable: c.nullable,
  defaultValue: c.default_value,
  createdAt: c.created_at,
  column_position: c.column_position,
  relation_type: c.relation_type,
  validations:  c.validations,
  ...c,
});

// Mapear del frontend al backend
const mapColumnToBackend = (c) => {
  const payload = {
    table_id: c.table_id,
    name: c.name,
    data_type: c.data_type,
    is_required: c.is_required,
    is_foreign_key: c.is_foreign_key,
    column_position: c.column_position,
    relation_type: c.relation_type,
    validations:  c.validations,
  };

  const makePosition = (c) => ({
      position: c.position,
      ...c,
    });


  // Solo incluir si es foreign key válida
  if (c.is_foreign_key && c.foreign_table_id) {
    payload.foreign_table_id = c.foreign_table_id;
  }

  if (c.is_foreign_key && c.foreign_column_name && c.foreign_column_name.trim() !== '') {
    payload.foreign_column_name = c.foreign_column_name;
  }

  return payload;
};

// Obtener todas las columnas
export async function getColumns() {
  const res = await axios.get('/columns');
  return res.data.map(mapColumnFromBackend);
}

// Crear una nueva columna
export async function createColumn(column) {
  const payload = mapColumnToBackend(column);
  console.log("payload", payload);
  const res = await axios.post('/columns', payload);
  return mapColumnFromBackend(res.data);
}

// Obtener columnas por tabla
export async function getColumnsByTable(tableId) {
  const res = await axios.get(`/columns/table/${tableId}`);
  return res.data.map(mapColumnFromBackend);
}

// Obtener columna por ID
export async function getColumnById(columnId) {
  const res = await axios.get(`/columns/${columnId}`);
  return mapColumnFromBackend(res.data);
}

// Actualizar columna
export async function updateColumn(columnId, updatedColumn) {
  const payload = mapColumnToBackend(updatedColumn);
  const res = await axios.put(`/columns/${columnId}`, payload);
  return mapColumnFromBackend(res.data);
}

// Eliminar columna
export async function deleteColumn(columnId) {
  const res = await axios.delete(`/columns/${columnId}`);
  return res.data;
}

// Verificar si existe nombre duplicado en una tabla
export async function checkColumnNameExists(tableId, columnName) {
  const res = await axios.get(`/columns/table/${tableId}/exists-name`, {
    params: { name: columnName },
  });
  return res.data.exists;
}

// Verificar si una columna tiene registros asociados
export async function checkColumnHasRecords(columnId) {
  const res = await axios.get(`/columns/${columnId}/has-records`);
  return res.data.hasRecords;
}


export async function updateColumnPosition(columnId, newPosition) {
  const res = await axios.patch(`/columns/${columnId}/update_cols`, {
    position: newPosition,
  });
  return res.data.message; // o lo que devuelva el backend
}
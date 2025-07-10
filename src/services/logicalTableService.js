// Servicio para obtener estructura y registros de tablas lógicas
import axios from "../lib/axios";

// Obtener estructura de la tabla (metadatos de columnas)
export async function getLogicalTableStructure(tableId) {
  // Obtener columnas para la tabla
  const { data } = await axios.get(`/columns/table/${tableId}`);

  return data; // Array de columnas/campos
}

// Obtener registros de una tabla lógica (con filtros y paginación opcionales)
export async function getLogicalTableRecords(tableId, params = {}) {
  // params: { page, pageSize, filters, search }
  const { data } = await axios.get(`/records/table/${tableId}`, { params });
  return data; // Array de registros
}

// Crear un nuevo registro en una tabla lógica
export async function createLogicalTableRecord(tableId, recordData) {
  // recordData: { ...campos }
  // Obtener columnas para validar y transformar los datos según el tipo
  const { data: columns } = await axios.get(`/columns/table/${tableId}`);
  const record = {};
  columns.forEach((col) => {
    let value = recordData[col.name];
    // Transformar el valor según el tipo de dato
    switch (col.data_type) {
      case "number":
        value = value !== undefined && value !== "" ? Number(value) : null;
        break;
      case "boolean":
        value = Boolean(value);
        break;
      case "date":
        value = value || null;
        break;
      case "file":
        // Para archivos, mantener la estructura con file_id
        value = value || null;
        break;
      case "file_array":
        // Para arrays de archivos, mantener el array
        value = Array.isArray(value) ? value : [];
        break;
      default:
        value = value || "";
    }
    record[col.name] = value;
  });
  const { data } = await axios.post("/records/", {
    table_id: tableId,
    record_data: record,
  });
  return data;
}

// Actualizar un registro en una tabla lógica
export async function updateLogicalTableRecord(recordId, recordData, positionNum) {
   const response = await axios.put(`/records/${recordId}`, {
    recordData,
    position_num: positionNum,
  });
  
  return response;
}

// Eliminar un registro en una tabla lógica
export async function deleteLogicalTableRecord(recordId) {
  const { data } = await axios.delete(`/records//${recordId}`);
  return data;
}



export async function updateRecordPosition(recordId, newPosition) {
  const res = await axios.patch(`/records/${recordId}/update_records`, {
    position: newPosition,
  });
  return res.data.message; // o lo que devuelva el backend
}

export async function getRecordsByTableId (tableId) {
  const res = await axios.get(`/records/table/${tableId}`);
  return res.data; // o lo que devuelva el backend
}


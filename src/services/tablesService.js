// tablesService.js
// Servicio para obtener las tablas del sistema
import axios from '../lib/axios';

export async function getTables() {
  const res = await axios.get("/tables");
  // Espera un array de objetos: [{ id, name }]
  return res.data;
}

export async function getOrCreateJoinTable(tableA_id, tableB_id) {
  const res = await axios.post('/tables/join', { tableA_id, tableB_id });
  return res.data; // { status: 'found' | 'created', joinTable }
}

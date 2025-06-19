// tablesService.js
// Servicio para obtener las tablas del sistema
import axios from '../lib/axios';

export async function getTables() {
  const res = await axios.get("/tables");
  // Espera un array de objetos: [{ id, name }]
  return res.data;
}

import axios from '../lib/axios';
import { getTables } from "@/services/tablesService";

export async function getRoles({ page = 1, search = '' } = {}) {
  const res = await axios.get('/roles', {
    params: { page, search }
  });
  return res.data;
}

export async function createRole({ name, description }) {
  const res = await axios.post('/roles', { name, description });
  return res.data;
}

export async function updateRole({ id, name, description,  is_admin}) {
  const res = await axios.put(`/roles/${id}`, { name, description, is_admin });
  return res.data;
}

export async function deleteRole(roleId) {
  return axios.delete(`/roles/${roleId}`);
}

export async function getRolesTableId() {
  try {
    const tables = await getTables();
    const rolesTable = tables.find(table => table.name === 'roles_sistema');
    
    if (!rolesTable) {
      throw new Error('No se encontró la tabla de roles_sistema');
    }
    
    return rolesTable.id;
  } catch (error) {
    console.error('Error getting roles table ID:', error);
    throw error;
  }
}

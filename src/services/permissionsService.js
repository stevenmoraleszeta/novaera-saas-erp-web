// permissionsService.js
// Servicios para gestión de permisos por rol
import axios from '../lib/axios';

export async function getPermissionsByRole(roleId) {
  const res = await axios.get(`/permissions/role/${roleId}`);
  // Espera un array de objetos: [{ table_id, can_read, can_create, can_update, can_delete }]
  return res.data;
}

export async function updatePermission(roleId, tableId, actions) {
  // actions: { can_read, can_create, can_update, can_delete }
  return axios.put(`/permissions/role/${roleId}/table/${tableId}`, actions);
}

export async function bulkUpdatePermissions(roleId, permsMap) {
  // permsMap: { [tableId]: { can_read, can_create, can_update, can_delete } }
  return axios.post(`/permissions/role/${roleId}/bulk`, { permissions: permsMap });
}

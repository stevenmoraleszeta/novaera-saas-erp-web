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

// Get all tables for permissions matrix
export async function getTables() {
  const res = await axios.get('/tables');
  return res.data;
}

// Nuevas funciones para verificar permisos del usuario actual
export async function getMyPermissions(tableId) {
  try {
    const response = await axios.get(`/permissions/my-permissions/table/${tableId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting my permissions:", error);
    throw error;
  }
}

export async function getMyPermissionsForAllTables() {
  try {
    const response = await axios.get("/permissions/my-permissions/all-tables");
    return response.data;
  } catch (error) {
    console.error("Error getting my permissions for all tables:", error);
    throw error;
  }
}

export async function getUserPermissions(userId, tableId) {
  try {
    const response = await axios.get(`/permissions/user/${userId}/table/${tableId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting user permissions:", error);
    throw error;
  }
}

export async function getUserPermissionsForAllTables(userId) {
  try {
    const response = await axios.get(`/permissions/user/${userId}/all-tables`);
    return response.data;
  } catch (error) {
    console.error("Error getting user permissions for all tables:", error);
    throw error;
  }
}

import axios from "../lib/axios";

// Obtener usuarios asignados a un record
export async function getAssignedUsersByRecord(recordId) {
  const { data } = await axios.get(`/record-assigned-users/${recordId}`);
  return data; // [{ user_id, name, email, avatar_url }]
}

// Asignar usuarios a un record
export async function setAssignedUsersForRecord(recordId, userIds) {
  const { data } = await axios.post(`/record-assigned-users/${recordId}`, {
    user_ids: userIds,
  });
  return data;
}

// Verificar si una tabla tiene usuarios asignados
export async function hasAssignedUsersInTable(tableId) {
  try {
    const { data } = await axios.get(`/record-assigned-users/table/${tableId}/has-users`);
    return data.hasUsers;
  } catch (error) {
    console.error('Error checking assigned users:', error);
    return false;
  }
}

// Obtener estadísticas de usuarios asignados por tabla
export async function getAssignedUsersStatsForTable(tableId) {
  try {
    const { data } = await axios.get(`/record-assigned-users/table/${tableId}/stats`);
    return data;
  } catch (error) {
    console.error('Error getting assigned users stats:', error);
    return { totalRecords: 0, recordsWithUsers: 0, totalUsers: 0 };
  }
}

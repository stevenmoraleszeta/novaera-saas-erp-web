import axios from '../lib/axios';

// Mapear del backend al frontend
const mapNotificationFromBackend = (n) => ({
  id: n.id,
  userId: n.user_id,
  title: n.title,
  message: n.message,
  linkToModule: n.link_to_module,
  isRead: n.read,
  createdAt: n.created_at,
  ...n,
});

// Mapear del frontend al backend
const mapNotificationToBackend = (n) => ({
  user_id: n.userId,
  title: n.title,
  message: n.message,
  link_to_module: n.linkToModule,
  read: n.isRead,
});

// Obtener todas
export async function getNotifications() {
  const res = await axios.get('/notifications');
  return res.data.map(mapNotificationFromBackend);
}

// Crear individual
export async function createNotification(notification) {
  const payload = mapNotificationToBackend(notification);
  const res = await axios.post('/notifications', payload);
  return mapNotificationFromBackend(res.data);
}

// Obtener por usuario
export async function getNotificationsByUser(userId) {
  const res = await axios.get(`/notifications/user/${userId}`);
  return res.data.map(mapNotificationFromBackend);
}

// Marcar como leída
export async function markAsRead(userId, notificationId) {
  const res = await axios.put(`/notifications/${notificationId}/read`, {
    user_id: userId,
  });
  return res.data;
}

// Marcar todas como leídas
export async function markAllAsRead(userId) {
  const res = await axios.put(`/notifications/user/${userId}/read-all`);
  return res.data;
}

// Eliminar una
export async function deleteNotification(userId, notificationId) {
  const res = await axios.delete(`/notifications/${notificationId}`, {
    data: { user_id: userId },
  });
  return res.data;
}

// Eliminar todas
export async function deleteAllNotifications(userId) {
  const res = await axios.delete(`/notifications/user/${userId}`);
  return res.data;
}

// Contar no leídas
export async function countUnread(userId) {
  const res = await axios.get(`/notifications/user/${userId}/unread-count`);
  return res.data.count;
}

// Crear masivas
export async function createMassiveNotifications({ user_ids, title, message, linkToModule }) {
  const payload = {
    user_ids,
    title,
    message,
    link_to_module: linkToModule,
  };
  const res = await axios.post('/notifications/massive', payload);
  return res.data;
}

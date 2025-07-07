import axios from '@/lib/axios';

// Crear notificación programada
export const createScheduledNotification = async (data) => {
  const response = await axios.post('/scheduled-notifications', data);
  return response.data;
};

// Obtener notificaciones del usuario
export const getUserScheduledNotifications = async () => {
  const response = await axios.get('/scheduled-notifications/user');
  return response.data;
};

// Obtener notificaciones por tabla
export const getNotificationsByTable = async (tableId) => {
  const response = await axios.get(`/scheduled-notifications/table/${tableId}`);
  return response.data;
};

// Obtener notificaciones por registro específico
export const getNotificationsByRecord = async (tableId, recordId) => {
  const response = await axios.get(`/scheduled-notifications/record/${tableId}/${recordId}`);
  return response.data;
};

// Actualizar notificación
export const updateScheduledNotification = async (id, data) => {
  const response = await axios.put(`/scheduled-notifications/${id}`, data);
  return response.data;
};

// Eliminar notificación
export const deleteScheduledNotification = async (id) => {
  const response = await axios.delete(`/scheduled-notifications/${id}`);
  return response.data;
};

// Obtener estadísticas
export const getStats = async () => {
  const response = await axios.get('/scheduled-notifications/stats');
  return response.data;
};

// Obtener columnas de fecha de una tabla
export const getDateColumns = async (tableId) => {
  const response = await axios.get(`/scheduled-notifications/date-columns/${tableId}`);
  return response.data;
};

// Suscribirse a cambios
export const subscribeToRecord = async (data) => {
  const response = await axios.post('/scheduled-notifications/subscriptions', data);
  return response.data;
};

// Obtener suscripciones del usuario
export const getUserSubscriptions = async () => {
  const response = await axios.get('/scheduled-notifications/subscriptions/user');
  return response.data;
};

// Verificar suscripción
export const checkSubscription = async (tableId, recordId) => {
  const response = await axios.get(`/scheduled-notifications/subscriptions/check/${tableId}/${recordId}`);
  return response.data;
};

// Eliminar suscripción
export const deleteSubscription = async (id) => {
  const response = await axios.delete(`/scheduled-notifications/subscriptions/${id}`);
  return response.data;
};

// Obtener estadísticas de suscripciones
export const getSubscriptionStats = async () => {
  const response = await axios.get('/scheduled-notifications/subscriptions/stats');
  return response.data;
};

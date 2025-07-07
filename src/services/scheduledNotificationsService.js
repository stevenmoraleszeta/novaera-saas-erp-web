import axios from '../lib/axios';

// Servicio para notificaciones programadas
class ScheduledNotificationsService {
  
  // Crear una notificación programada
  async createScheduledNotification(data) {
    const response = await axios.post('/scheduled-notifications', data);
    return response.data;
  }

  // Obtener notificaciones programadas del usuario
  async getUserScheduledNotifications() {
    const response = await axios.get('/scheduled-notifications/user');
    return response.data;
  }

  // Obtener notificaciones por tabla
  async getNotificationsByTable(tableId) {
    const response = await axios.get(`/scheduled-notifications/table/${tableId}`);
    return response.data;
  }

  // Obtener estadísticas de notificaciones
  async getNotificationStats() {
    const response = await axios.get('/scheduled-notifications/stats');
    return response.data;
  }

  // Obtener columnas de fecha de una tabla
  async getDateColumns(tableId) {
    const response = await axios.get(`/scheduled-notifications/date-columns/${tableId}`);
    return response.data;
  }

  // Actualizar notificación programada
  async updateScheduledNotification(id, data) {
    const response = await axios.put(`/scheduled-notifications/${id}`, data);
    return response.data;
  }

  // Eliminar notificación programada
  async deleteScheduledNotification(id) {
    const response = await axios.delete(`/scheduled-notifications/${id}`);
    return response.data;
  }

  // Suscribirse a cambios en registros
  async subscribeToRecord(data) {
    const response = await axios.post('/scheduled-notifications/subscriptions', data);
    return response.data;
  }

  // Obtener suscripciones del usuario
  async getUserSubscriptions() {
    const response = await axios.get('/scheduled-notifications/subscriptions/user');
    return response.data;
  }

  // Verificar si está suscrito a un registro
  async checkSubscription(tableId, recordId) {
    const response = await axios.get(`/scheduled-notifications/subscriptions/check/${tableId}/${recordId}`);
    return response.data;
  }

  // Obtener estadísticas de suscripciones
  async getSubscriptionStats() {
    const response = await axios.get('/scheduled-notifications/subscriptions/stats');
    return response.data;
  }

  // Actualizar suscripción
  async updateSubscription(id, data) {
    const response = await axios.put(`/scheduled-notifications/subscriptions/${id}`, data);
    return response.data;
  }

  // Eliminar suscripción
  async deleteSubscription(id) {
    const response = await axios.delete(`/scheduled-notifications/subscriptions/${id}`);
    return response.data;
  }

  // Obtener historial de cambios
  async getRecordChanges(tableId, recordId) {
    const response = await axios.get(`/scheduled-notifications/changes/${tableId}/${recordId}`);
    return response.data;
  }

  // Obtener notificaciones por tabla y registro
  async getScheduledNotifications(tableId, recordId) {
    const response = await axios.get(`/scheduled-notifications/${tableId}/${recordId}`);
    return response.data;
  }

  // Obtener notificaciones por usuario (las que le están asignadas)
  async getNotificationsByUser(userId) {
    const response = await axios.get(`/scheduled-notifications/user/${userId}`);
    return response.data;
  }

  // Obtener todas las notificaciones de un usuario
  async getAllNotificationsByUser(userId) {
    const response = await axios.get(`/scheduled-notifications/user/${userId}/all`);
    return response.data;
  }

  // Obtener usuarios disponibles
  async getUsers() {
    const response = await axios.get('/users');
    return response.data;
  }

  // Marcar notificación como leída
  async markNotificationAsRead(notificationId) {
    const response = await axios.put(`/scheduled-notifications/${notificationId}/read`);
    return response.data;
  }

  // Obtener todas las notificaciones del usuario (combinadas)
  async getAllUserNotifications(userId) {
    const response = await axios.get(`/scheduled-notifications/user/${userId}/combined`);
    return response.data;
  }

  // Obtener notificaciones generales del usuario
  async getUserNotifications(userId) {
    const response = await axios.get(`/notifications/user/${userId}`);
    return response.data;
  }

  // Marcar notificación general como leída
  async markGeneralNotificationAsRead(notificationId) {
    const response = await axios.put(`/notifications/${notificationId}/read`);
    return response.data;
  }
}

export default new ScheduledNotificationsService();

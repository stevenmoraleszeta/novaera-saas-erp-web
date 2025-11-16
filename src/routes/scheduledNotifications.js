// Endpoint para desactivar (soft delete) una notificación normal
const express = require('express');
const router = express.Router();
const scheduledNotificationsController = require('../controllers/scheduledNotificationsController');


// Rutas para notificaciones programadas
router.post('/', scheduledNotificationsController.create);
router.get('/user', scheduledNotificationsController.getByUser);
router.get('/user/:userId/combined', scheduledNotificationsController.getAllUserNotifications);
router.get('/user/:userId/general', scheduledNotificationsController.getUserGeneralNotifications);
router.put('/general/:notificationId/read', scheduledNotificationsController.markGeneralNotificationAsRead);
router.get('/table/:tableId', scheduledNotificationsController.getByTable);
router.get('/record/:tableId/:recordId', scheduledNotificationsController.getByRecord);
router.get('/stats', scheduledNotificationsController.getStats);
router.get('/date-columns/:tableId', scheduledNotificationsController.getDateColumns);
router.put('/:notificationId/read', scheduledNotificationsController.markScheduledNotificationAsRead);
router.put('/:id', scheduledNotificationsController.update);
router.delete('/:id', scheduledNotificationsController.delete);

// Endpoint para desactivar (soft delete) una notificación programada
router.put('/:id/deactivate', scheduledNotificationsController.deactivate);
router.put('/deactivate/all', scheduledNotificationsController.deactivateAll);

// Rutas para suscripciones
router.post('/subscriptions', scheduledNotificationsController.subscribe);
router.get('/subscriptions/user', scheduledNotificationsController.getUserSubscriptions);
router.get('/subscriptions/check/:tableId/:recordId', scheduledNotificationsController.checkSubscription);
router.get('/subscriptions/stats', scheduledNotificationsController.getSubscriptionStats);
router.delete('/subscriptions/:id', scheduledNotificationsController.deleteSubscription);

module.exports = router;

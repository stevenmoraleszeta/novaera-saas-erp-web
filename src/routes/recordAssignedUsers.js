const express = require('express');
const router = express.Router();
const recordAssignedUsersController = require('../controllers/recordAssignedUsersController');

// GET: usuarios asignados a un record
router.get('/:record_id', recordAssignedUsersController.getAssignedUsersByRecord);
// POST: asignar usuarios a un record (sobrescribe)
router.post('/:record_id', recordAssignedUsersController.setAssignedUsersForRecord);

// GET: verificar si una tabla tiene usuarios asignados
router.get('/table/:table_id/has-users', recordAssignedUsersController.hasAssignedUsersInTable);
// GET: obtener estadísticas de usuarios asignados por tabla
router.get('/table/:table_id/stats', recordAssignedUsersController.getAssignedUsersStatsForTable);

module.exports = router;

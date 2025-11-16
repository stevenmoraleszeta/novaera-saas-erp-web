const express = require('express');
const router = express.Router();
const recordCommentsController = require('../controllers/recordCommentsController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear comentario
router.post('/', recordCommentsController.createComment);

// Obtener comentarios de un registro
router.get('/record/:record_id', recordCommentsController.getCommentsByRecord);

// Contar comentarios de un registro
router.get('/record/:record_id/count', recordCommentsController.getCommentsCount);

// Actualizar comentario
router.put('/:id', recordCommentsController.updateComment);

// Eliminar comentario
router.delete('/:id', recordCommentsController.deleteComment);

module.exports = router;

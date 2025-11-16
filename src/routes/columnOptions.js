// Rutas para opciones personalizadas de columnas
const express = require('express');
const router = express.Router();
const columnOptionsController = require('../controllers/columnOptionsController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Crear/actualizar opciones personalizadas para una columna
// POST /api/columns/:columnId/options
// Body: { options: [{ value: "valor", label: "Etiqueta" }, ...] }
router.post('/columns/:columnId/options', columnOptionsController.createColumnOptions);

// Obtener opciones personalizadas de una columna específica
// GET /api/columns/:columnId/options
router.get('/columns/:columnId/options', columnOptionsController.getColumnOptions);

// Obtener todas las opciones disponibles para una columna (personalizadas o de tabla)
// GET /api/columns/:columnId/available-options
router.get('/columns/:columnId/available-options', columnOptionsController.getAvailableOptions);

// Actualizar una opción específica
// PUT /api/options/:optionId
// Body: { option_value: "nuevo_valor", option_label: "Nueva Etiqueta", option_order: 1, is_active: true }
router.put('/options/:optionId', columnOptionsController.updateColumnOption);

// Eliminar una opción específica (soft delete)
// DELETE /api/options/:optionId
router.delete('/options/:optionId', columnOptionsController.deleteColumnOption);

// Eliminar todas las opciones de una columna
// DELETE /api/columns/:columnId/options
router.delete('/columns/:columnId/options', columnOptionsController.deleteColumnOptions);

module.exports = router;

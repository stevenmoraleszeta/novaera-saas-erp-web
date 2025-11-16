const express = require('express');
const router = express.Router();
const filesController = require('../controllers/filesController');
const validateFile = require('../middleware/validateFile');

// Subir archivo
router.post('/upload', validateFile, filesController.uploadFile);

// Descargar archivo
router.get('/download/:id', filesController.downloadFile);

// Ver archivo en el navegador
router.get('/view/:id', filesController.viewFile);

// Obtener información del archivo
router.get('/:id', filesController.getFileInfo);

// Eliminar archivo
router.delete('/:id', filesController.deleteFile);

// Obtener archivos del usuario
router.get('/user/files', filesController.getUserFiles);

// Validar integridad del archivo
router.get('/validate/:id', filesController.validateFile);

module.exports = router;

const fileUtils = require('../utils/fileUtils');

const validateFile = (req, res, next) => {
  try {
    const { originalName, mimeType, fileData } = req.body;
    
    // Validar campos requeridos
    if (!originalName || !mimeType || !fileData) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: originalName, mimeType, fileData' 
      });
    }
    
    // Validar tipo de archivo
    if (!fileUtils.isValidFileType(mimeType)) {
      return res.status(400).json({ 
        error: 'Tipo de archivo no permitido' 
      });
    }
    
    // Validar base64
    try {
      const buffer = Buffer.from(fileData, 'base64');
      const fileSize = buffer.length;
      
      // Validar tamaño
      if (!fileUtils.isValidFileSize(fileSize)) {
        return res.status(400).json({ 
          error: 'El archivo es demasiado grande (máximo 10MB)' 
        });
      }
      
      // Agregar información del archivo al request
      req.fileInfo = {
        originalName,
        mimeType,
        fileData,
        fileSize
      };
      
      next();
    } catch (error) {
      return res.status(400).json({ 
        error: 'Formato de archivo inválido' 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error al validar archivo' 
    });
  }
};

module.exports = validateFile;

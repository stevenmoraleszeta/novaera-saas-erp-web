const pool = require('../config/db');
const crypto = require('crypto');

class FilesService {
  // Subir archivo
  async uploadFile(fileData) {
    const { originalName, mimeType, fileDataBase64, userId } = fileData;
    
    try {
      // Convertir base64 a buffer
      const buffer = Buffer.from(fileDataBase64, 'base64');
      const fileSize = buffer.length;
      
      // Generar hash para verificar integridad
      const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
      
      // Validar tamaño del archivo (máximo 10MB)
      if (fileSize > 10 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande (máximo 10MB)');
      }
      
      // Validar tipo MIME
      const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedMimeTypes.includes(mimeType)) {
        throw new Error('Tipo de archivo no permitido');
      }
      
      const query = `
        INSERT INTO files (original_name, file_data, file_size, mime_type, uploaded_by, file_hash)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, original_name, file_size, mime_type, uploaded_at, file_hash
      `;
      
      const result = await pool.query(query, [
        originalName, buffer, fileSize, mimeType, userId, fileHash
      ]);
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al subir archivo: ${error.message}`);
    }
  }

  // Obtener archivo por ID
  async getFile(fileId) {
    try {
      const query = `
        SELECT id, original_name, file_data, file_size, mime_type, uploaded_at, file_hash
        FROM files 
        WHERE id = $1 AND is_active = true
      `;
      
      const result = await pool.query(query, [fileId]);
      
      if (result.rows.length === 0) {
        throw new Error('Archivo no encontrado');
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener archivo: ${error.message}`);
    }
  }

  // Obtener información del archivo (sin datos binarios)
  async getFileInfo(fileId) {
    try {
      const query = `
        SELECT id, original_name, file_size, mime_type, uploaded_at, file_hash
        FROM files 
        WHERE id = $1 AND is_active = true
      `;
      
      const result = await pool.query(query, [fileId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener información del archivo: ${error.message}`);
    }
  }

  // Eliminar archivo (soft delete)
  async deleteFile(fileId, userId) {
    try {
      const query = `
        UPDATE files 
        SET is_active = false 
        WHERE id = $1 AND uploaded_by = $2
        RETURNING id
      `;
      
      const result = await pool.query(query, [fileId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Archivo no encontrado o no tienes permisos para eliminarlo');
      }
      
      return { success: true, message: 'Archivo eliminado correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar archivo: ${error.message}`);
    }
  }

  // Obtener archivos por usuario
  async getFilesByUser(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT id, original_name, file_size, mime_type, uploaded_at, file_hash
        FROM files 
        WHERE uploaded_by = $1 AND is_active = true
        ORDER BY uploaded_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [userId, limit, offset]);
      
      // Contar total de archivos
      const countQuery = `
        SELECT COUNT(*) as total
        FROM files 
        WHERE uploaded_by = $1 AND is_active = true
      `;
      
      const countResult = await pool.query(countQuery, [userId]);
      
      return {
        files: result.rows,
        total: parseInt(countResult.rows[0].total),
        page,
        limit,
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      };
    } catch (error) {
      throw new Error(`Error al obtener archivos del usuario: ${error.message}`);
    }
  }

  // Validar integridad del archivo
  async validateFileIntegrity(fileId) {
    try {
      const file = await this.getFile(fileId);
      
      const currentHash = crypto.createHash('sha256').update(file.file_data).digest('hex');
      
      return {
        isValid: currentHash === file.file_hash,
        originalHash: file.file_hash,
        currentHash
      };
    } catch (error) {
      throw new Error(`Error al validar integridad del archivo: ${error.message}`);
    }
  }
}

module.exports = new FilesService();

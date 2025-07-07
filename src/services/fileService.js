// Servicio para manejar archivos
import axios from "../lib/axios";

// Convertir archivo a base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};

// Subir archivo
export async function uploadFile(file) {
  try {
    const base64Data = await fileToBase64(file);
    
    const { data } = await axios.post('/files/upload', {
      originalName: file.name,
      mimeType: file.type,
      fileData: base64Data
    });
    
    return data.file;
  } catch (error) {
    throw new Error(`Error al subir archivo: ${error.response?.data?.error || error.message}`);
  }
}

// Obtener información del archivo
export async function getFileInfo(fileId) {
  try {
    const { data } = await axios.get(`/files/${fileId}`);
    return data;
  } catch (error) {
    throw new Error(`Error al obtener información del archivo: ${error.response?.data?.error || error.message}`);
  }
}

// Eliminar archivo
export async function deleteFile(fileId) {
  try {
    const { data } = await axios.delete(`/files/${fileId}`);
    return data;
  } catch (error) {
    throw new Error(`Error al eliminar archivo: ${error.response?.data?.error || error.message}`);
  }
}

// Obtener URL de descarga
export function getDownloadUrl(fileId) {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return `${baseURL}/files/download/${fileId}`;
}

// Obtener URL de visualización
export function getViewUrl(fileId) {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return `${baseURL}/files/view/${fileId}`;
}

// Validar archivo
export function validateFile(file) {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido');
  }
  
  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande (máximo 10MB)');
  }
  
  return true;
}

// Formatear tamaño de archivo
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Obtener icono para tipo de archivo
export function getFileIcon(mimeType) {
  const iconMap = {
    'image/jpeg': '🖼️',
    'image/png': '🖼️',
    'image/gif': '🖼️',
    'image/webp': '🖼️',
    'application/pdf': '📄',
    'text/plain': '📝',
    'application/msword': '📄',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📄',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊'
  };
  
  return iconMap[mimeType] || '📎';
}

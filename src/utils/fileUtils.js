// Utilidades para manejar archivos
const fileUtils = {
  // Convertir archivo a base64
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  },

  // Formatear tamaño de archivo
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validar tipo de archivo
  isValidFileType: (mimeType) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    return allowedTypes.includes(mimeType);
  },

  // Obtener icono para tipo de archivo
  getFileIcon: (mimeType) => {
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
  },

  // Validar tamaño máximo
  isValidFileSize: (size, maxSize = 10 * 1024 * 1024) => {
    return size <= maxSize;
  }
};

module.exports = fileUtils;

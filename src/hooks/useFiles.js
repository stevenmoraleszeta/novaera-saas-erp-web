import { useState } from 'react';
import { 
  uploadFile, 
  getFileInfo, 
  deleteFile,
  validateFile 
} from '@/services/fileService';

export function useFiles() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (file) => {
    setLoading(true);
    setError(null);
    
    try {
      validateFile(file);
      const result = await uploadFile(file);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadMultiple = async (files) => {
    setLoading(true);
    setError(null);
    
    try {
      const uploadedFiles = [];
      for (const file of files) {
        validateFile(file);
        const result = await uploadFile(file);
        uploadedFiles.push(result);
      }
      return uploadedFiles;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getInfo = async (fileId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getFileInfo(fileId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (fileId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteFile(fileId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    upload,
    uploadMultiple,
    getInfo,
    remove,
    loading,
    error,
    clearError
  };
}

import axios from "../lib/axios";

// Crear comentario
export const createComment = async (recordId, tableId, commentText) => {
  try {
    const response = await axios.post('/record-comments', {
      record_id: recordId,
      table_id: tableId,
      comment_text: commentText
    });
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// Obtener comentarios de un registro
export const getCommentsByRecord = async (recordId, limit = 50, offset = 0) => {
  try {
    const response = await axios.get(`/record-comments/record/${recordId}`, {
      params: { limit, offset }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

// Actualizar comentario
export const updateComment = async (commentId, commentText) => {
  try {
    const response = await axios.put(`/record-comments/${commentId}`, {
      comment_text: commentText
    });
    return response.data;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

// Eliminar comentario
export const deleteComment = async (commentId) => {
  try {
    const response = await axios.delete(`/record-comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Contar comentarios de un registro
export const getCommentsCount = async (recordId) => {
  try {
    const response = await axios.get(`/record-comments/record/${recordId}/count`);
    return response.data.count;
  } catch (error) {
    console.error('Error counting comments:', error);
    throw error;
  }
};

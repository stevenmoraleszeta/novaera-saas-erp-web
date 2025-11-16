const pool = require('../config/db');

// Crear comentario
exports.createComment = async (req, res) => {
  try {
    const { record_id, table_id, comment_text } = req.body;
    const user_id = req.user?.id; // Asumiendo que tienes middleware de auth

    if (!user_id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const result = await pool.query(
      'SELECT sp_crear_comentario($1, $2, $3, $4) AS result',
      [record_id, table_id, user_id, comment_text]
    );

    const response = result.rows[0].result;
    
    if (response.error) {
      return res.status(400).json({ error: response.error });
    }

    res.status(201).json(response);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener comentarios de un registro
exports.getCommentsByRecord = async (req, res) => {
  try {
    const { record_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      'SELECT * FROM sp_obtener_comentarios_registro($1, $2, $3)',
      [record_id, parseInt(limit), parseInt(offset)]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error getting comments:', err);
    res.status(500).json({ error: err.message });
  }
};

// Actualizar comentario
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment_text } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const result = await pool.query(
      'SELECT sp_actualizar_comentario($1, $2, $3) AS message',
      [id, user_id, comment_text]
    );

    res.json({ message: result.rows[0].message });
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ error: err.message });
  }
};

// Eliminar comentario
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const result = await pool.query(
      'SELECT sp_eliminar_comentario($1, $2) AS message',
      [id, user_id]
    );

    res.json({ message: result.rows[0].message });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: err.message });
  }
};

// Contar comentarios de un registro
exports.getCommentsCount = async (req, res) => {
  try {
    const { record_id } = req.params;

    const result = await pool.query(
      'SELECT sp_contar_comentarios_registro($1) AS count',
      [record_id]
    );

    res.json({ count: result.rows[0].count });
  } catch (err) {
    console.error('Error counting comments:', err);
    res.status(500).json({ error: err.message });
  }
};

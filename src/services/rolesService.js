const pool = require('../config/db');

exports.getRoles = async () => {
  // Retorna solo los roles activos
  const result = await pool.query('SELECT * FROM roles WHERE active = true ORDER BY name');
  return result.rows;
};

exports.createRole = async ({ name, description = null, is_admin = false }) => {
  // Usa la función crear_rol para mantener toda la lógica de validación en la BD
  await pool.query(
    'SELECT crear_rol($1, $2, $3) AS message',
    [name, description, is_admin]
  );

  // Devuelve el rol recién creado consultándolo por nombre (evita hardcodear IDs)
  const result = await pool.query(
    'SELECT * FROM roles WHERE LOWER(name) = LOWER($1) ORDER BY id DESC LIMIT 1',
    [name]
  );

  return result.rows[0];
};

exports.getRoleById = async (id) => {
  // Retorna solo roles activos
  const result = await pool.query('SELECT * FROM roles WHERE id = $1 AND active = true', [id]);
  return result.rows[0];
};

exports.updateRole = async (
  id,
  { name = null, description = null, is_admin = null }
) => {
  const result = await pool.query(
    'SELECT actualizar_rol($1, $2, $3, $4) AS message',
    [id, name, description, is_admin]
  );
  return result.rows[0];
};

/*
exports.updateRole = async (id, { name }) => {
  // Actualiza solo el nombre si el rol está activo
  const result = await pool.query(
    'UPDATE roles SET name = $1 WHERE id = $2 AND active = true RETURNING *', 
    [name, id]
  );
  return result.rows[0];
}; */

exports.deleteRole = async (id) => {
  // Eliminación lógica - cambiar active a false en lugar de eliminar físicamente
  const result = await pool.query(
    'UPDATE roles SET active = false WHERE id = $1 AND active = true RETURNING *',
    [id]
  );
  if (result.rows.length === 0) {
    throw new Error('Rol no encontrado o ya está inactivo');
  }
  return { message: 'Rol eliminado correctamente', role: result.rows[0] };
};

exports.assignRoleToUser = async (user_id, role_id) => {
  const result = await pool.query('SELECT asignar_rol_a_usuario($1, $2) AS message', [user_id, role_id]);
  return result.rows[0];
};

exports.removeRoleFromUser = async (user_id, role_id) => {
  const result = await pool.query('SELECT eliminar_rol_de_usuario($1, $2) AS message', [user_id, role_id]);
  return result.rows[0];
};

exports.getRolesByUser = async (user_id) => {
  // Solo obtener roles activos del usuario
  const result = await pool.query(
    'SELECT r.* FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1 AND r.active = true ORDER BY r.name',
    [user_id]
  );
  return result.rows;
};

exports.setRolePermissions = async (role_id, table_id, can_create, can_read, can_update, can_delete) => {
  const result = await pool.query('SELECT establecer_permisos_rol_tabla($1, $2, $3, $4, $5, $6) AS message', [role_id, table_id, can_create, can_read, can_update, can_delete]);
  return result.rows[0];
};

exports.updateRolePermissions = async (role_id, table_id, can_create, can_read, can_update, can_delete) => {
  const result = await pool.query('SELECT actualizar_permisos_rol_tabla($1, $2, $3, $4, $5, $6) AS message', [role_id, table_id, can_create, can_read, can_update, can_delete]);
  return result.rows[0];
};

exports.getRolePermissions = async (role_id, table_id) => {
  const result = await pool.query('SELECT * FROM obtener_permisos_rol_tabla($1, $2)', [role_id, table_id]);
  return result.rows[0];
};

exports.deleteRolePermissions = async (role_id, table_id) => {
  const result = await pool.query('SELECT eliminar_permisos_rol_tabla($1, $2) AS message', [role_id, table_id]);
  return result.rows[0];
};
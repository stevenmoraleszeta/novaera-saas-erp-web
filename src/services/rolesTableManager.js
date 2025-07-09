import {
  createLogicalTableRecord,
  getRecordsByTableId,
  updateLogicalTableRecord,
  deleteLogicalTableRecord
} from "@/services/logicalTableService";

import { getTables } from "@/services/tablesService";

/**
 * Sincroniza la tabla lógica "roles_sistema" con los roles del sistema.
 */
export const sincronizarTablaRoles = async ({
  roles = [],
  userId = null,
  createOrUpdateTable,
  handleCreate
}) => {
  try {
    if (!roles.length) throw new Error("No hay roles para sincronizar.");

    // Buscar o crear tabla
    const todasLasTablas = await getTables();
    let tabla = todasLasTablas.find((t) => t.name === "roles_sistema");

    if (!tabla) {
      tabla = await createOrUpdateTable({
        name: "roles_sistema",
        description: "Tabla lógica de roles del sistema",
        module_id: null,
      });

      await handleCreate({
        name: "id",
        data_type: "number",
        is_required: true,
        table_id: tabla.id,
        created_by: userId,
        column_position: 0,
      });

      await handleCreate({
        name: "nombre",
        data_type: "string",
        is_required: true,
        table_id: tabla.id,
        created_by: userId,
        column_position: 1,
      });
    }

    const tablaId = tabla.id;
    const registrosExistentes = await getRecordsByTableId(tablaId);
    const registrosMap = new Map(
      registrosExistentes.map((r) => [r.record_data.id, r])
    );

    const rolesIds = new Set(roles.map((r) => r.id));
    const registrosIds = new Set(registrosExistentes.map((r) => r.record_data?.id));

    // Crear o actualizar
    for (const rol of roles) {
      const existente = registrosMap.get(rol.id);
      const nombreActual = rol.name;

      if (!existente) {
        await createLogicalTableRecord(tablaId, {
          id: rol.id,
          nombre: nombreActual,
        });
      } else if (existente.record_data.nombre !== nombreActual) {
        await updateLogicalTableRecord(existente.id, {
          id: rol.id,
          nombre: nombreActual,
        });
      }
    }

    // Eliminar roles eliminados
    for (const id of registrosIds) {
      if (!rolesIds.has(id)) {
        const registro = registrosMap.get(id);
        await deleteLogicalTableRecord(registro.id);
      }
    }

    console.log("✅ Tabla de roles sincronizada.");
    return tablaId;

  } catch (err) {
    console.error("❌ Error al sincronizar tabla de roles:", err);
    throw err;
  }
};

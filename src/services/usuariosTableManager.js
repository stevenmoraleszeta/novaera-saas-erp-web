import {
    createLogicalTableRecord, getRecordsByTableId, updateLogicalTableRecord, deleteLogicalTableRecord
} from "@/services/logicalTableService";

import { getTables } from "@/services/tablesService";

/**
 * Crea una tabla lógica "usuarios_sistema" y agrega todos los usuarios actuales.
 */
/**
 * Crea una tabla lógica "usuarios_sistema" con columnas y registros.
 */
let creandoTablaUsuarios = false;
export const crearTablaUsuarios = async ({
    usuarios = [],
    moduleId = null,
    userId = null,
    createOrUpdateTable,
    handleCreate,
}) => {

    try {
        if (!usuarios.length) throw new Error("No hay usuarios para crear.");

        // Obtener todas las tablas y buscar por nombre
        const todasLasTablas = await getTables();
        const tablaExistente = todasLasTablas.find(
            (t) => t.name === "usuarios_sistema"
        );

        if (tablaExistente) {

            if (creandoTablaUsuarios) {
                return;
            }

            creandoTablaUsuarios = true;
            try {
                const tablaId = tablaExistente.id;

                // Obtener registros existentes en la tabla
                const registrosExistentes = await getRecordsByTableId(tablaId);

                let idsExistentes = new Set(registrosExistentes.map((r) => r.record_data?.id));

                // Agregar solo los usuarios que no existen aún
                let nuevos = 0;
                for (const usuario of usuarios) {
                    if (!idsExistentes.has(usuario.id)) {
                        await createLogicalTableRecord(tablaId, {
                            id: usuario.id,
                            nombre: usuario.name || usuario.nombre || "Sin nombre",
                        });
                        nuevos++;
                    }
                }

                return tablaId;
            } finally {
                creandoTablaUsuarios = false;
            }

        } else {
            // Crear tabla lógica
            const tabla = await createOrUpdateTable({
                name: "usuarios_sistema",
                description: "Tabla lógica de usuarios del sistema",
                module_id: moduleId,
            });

            // Crear columnas
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

            // Insertar registros
            for (const usuario of usuarios) {
                await createLogicalTableRecord(tabla.id, {
                    id: usuario.id,
                    nombre: usuario.name || usuario.nombre || "Sin nombre",
                });
            }

            return tabla.id;
        }
    } catch (err) {
        console.error("❌ Error al crear tabla de usuarios:", err);
        throw err;
    }
};

export const sincronizarTablaUsuarios = async ({
    usuarios = [],
}) => {
    try {

        const todasLasTablas = await getTables();
        const tablaExistente = todasLasTablas.find(
            (t) => t.name === "usuarios_sistema"
        );
        const registrosExistentes = await getRecordsByTableId(tablaExistente.id);
        const registrosMap = new Map(
            registrosExistentes.map((r) => [r.record_data.id, r])
        );

        const usuariosIds = new Set(usuarios.map((u) => u.id));
        const registrosIds = new Set(registrosExistentes.map((r) => r.record_data?.id));

        // 1. Actualizar usuarios existentes si hay diferencias
        for (const usuario of usuarios) {
            const existente = registrosMap.get(usuario.id);
            const nombreActual = usuario.name || usuario.nombre || "Sin nombre";
            if (
                existente &&
                existente.record_data.nombre !== nombreActual
            ) {
                await updateLogicalTableRecord(existente.id, {
                    id: existente.record_data.id,
                    nombre: nombreActual,
                },);
            }
        }

        // 2. Eliminar registros que ya no existen como usuarios
        for (const id of registrosIds) {
            if (!usuariosIds.has(id)) {
                const registro = registrosMap.get(id);
                await deleteLogicalTableRecord(registro.id);
            }
        }

    } catch (err) {
        console.error("❌ Error al sincronizar tabla de usuarios:", err);
        throw err;
    }
};
"use client";

import React, { useState, useEffect, useCallback } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import {
  getLogicalTableStructure,
  createLogicalTableRecord,
  updateLogicalTableRecord,
  getLogicalTableRecords,
} from "@/services/logicalTableService";
import FieldRenderer from "../common/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle, Users, History } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import LogicalTableDataView from "@/components/tables/LogicalTableDataView";
import AssignedUsersCell from "@/components/tables/AssignedUsersCell";
import AuditLogModal from "./AuditLogModal";
import { getAssignedUsersByRecord } from "@/services/recordAssignedUsersService";
import axios from "@/lib/axios";
import { X } from "lucide-react";
import ConfirmationDialog from "../common/ConfirmationDialog";

import FileUpload from '@/components/common/FileUpload';

export default function DynamicRecordFormDialog({
  open = false,
  onOpenChange,
  tableId,
  mode = "create",
  record = null,
  onSubmitSuccess,
  onDelete,
  colName,
  foreignForm = false,
  lastPosition = 0,
  defaultValues
}) {

  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [foreignModalOpen, setForeignModalOpen] = useState(false);
  const [foreignModalColumn, setForeignModalColumn] = useState(null);
  const [intermediateTableId, setIntermediateTableId] = useState(null);
  const [columnName, setcolumnName] = useState(null);
  const [tables, setTables] = useState([]);
  const [pendingNotifications, setPendingNotifications] = useState([]);
  // Estado y función para el modal de tabla relacionada tipo 'tabla'
  const [relatedTableModalOpen, setRelatedTableModalOpen] = useState(false);
  const [relatedTableModalColumn, setRelatedTableModalColumn] = useState(null);
  const handleOpenRelatedTableModal = (col) => {
    //igual solo para que este abierto uno lateral a la vez
    setForeignModalOpen(false);
    setFileModalOpen(false);

    setRelatedTableModalColumn(col);
    setRelatedTableModalOpen(true);
  };
  // Estados y funciones para los archivos
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [fileModalColumn, setFileModalColumn] = useState(null);
  const handleOpenFileModal = (col) => {
    setForeignModalOpen(false);
    setRelatedTableModalOpen(false);
    setFileModalColumn(col);
    setFileModalOpen(true);
  };

  const [isDirty, setIsDirty] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Procesar notificaciones pendientes cuando se crea el registro
  const processPendingNotifications = async (newRecordId) => {
    for (const notif of pendingNotifications) {
      try {
        await scheduledNotificationsService.createScheduledNotification({
          table_id: tableId,
          record_id: newRecordId,
          column_id: notif.columnId,
          target_date: notif.targetDate,
          notification_title: notif.title,
          notification_message: notif.message,
          notify_before_days: notif.notify_before_days,
          assigned_users: notif.assigned_users
        });
      } catch (error) {
        console.error('Error enviando notificación pendiente:', error);
      }
    }
    setPendingNotifications([]);
  };

  // Estados para usuarios asignados
  const [hasNotificationColumns, setHasNotificationColumns] = useState(false);
  const [showAssignedUsersModal, setShowAssignedUsersModal] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState([]);

  // Modal para historial de cambios
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);

  // Obtener usuario autenticado
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!tableId || !open) return;
    (async () => {
      try {
        const cols = await getLogicalTableStructure(tableId);
        setColumns(cols);
        const initialValues = {};
        cols.forEach((col) => {
          if (foreignForm && col.name === "original_record_id") {
            initialValues[col.name] = colName.column_id;
            return;
          }
          if (mode === "edit" && record?.record_data?.[col.name] !== undefined) {
            initialValues[col.name] = castValueByDataType(col.data_type, record.record_data[col.name]);
          } else {
            // Valores por defecto según el tipo de dato
            switch (col.data_type) {
              case "boolean":
                initialValues[col.name] = defaultValues[col.name];
                break;
              case "integer":
              case "number":
                initialValues[col.name] = defaultValues[col.name];
                break;
              case "file":
                initialValues[col.name] = null;
                break;
              case "file_array":
                initialValues[col.name] = [];
                break;
              default:
                initialValues[col.name] = defaultValues[col.name];
            }
          }
        });
        setValues(initialValues);
        setErrors({});
        setSubmitError(null);
      } catch {
        setColumns([]);
        setValues({});
      }
    })();
  }, [tableId, open, mode, record]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/tables");
        setTables(res.data);
      } catch {
        setTables([]);
      }
    })();
  }, []);

  // Detectar columnas de notificaciones y cargar usuarios asignados
  useEffect(() => {
    if (columns.length > 0) {
      // Verificar si la tabla tiene columnas de fecha (funcionalidad de notificaciones)
      const hasDateColumns = columns.some(col =>
        ['date', 'datetime', 'timestamp'].includes(col.data_type)
      );
      setHasNotificationColumns(hasDateColumns);
    }
  }, [columns]);

  // Cargar usuarios asignados cuando el modal se abre en modo edición
  useEffect(() => {
    if (open && mode === "edit" && record?.id) {
      loadAssignedUsers();
    }
  }, [open, mode, record]);

  function castValueByDataType(type, value) {
    if (value === null || value === undefined) return value;
    switch (type) {
      case "int":
      case "integer":
      case "number": return parseInt(value, 10);
      case "float":
      case "decimal":
      case "double": return parseFloat(value);
      case "boolean": return Boolean(value);
      case "user": return typeof value === "string" ? value : value?.id ?? "";
      case "date":
      case "datetime":
      case "timestamp": return typeof value === "string" ? value : new Date(value).toISOString().slice(0, 16);
      case "file": return value || null;
      case "file_array": return Array.isArray(value) ? value : [];
      default: return value;
    }
  }

  const validate = useCallback(() => {
    const errs = {};
    columns.forEach((col) => {
      if (col.is_required && (values[col.name] === "" || values[col.name] == null)) {
        errs[col.name] = "Este campo es requerido";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [columns, values]);

  const handleChange = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setIsDirty(true);
  }, []);

  const handleAttemptClose = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      let result;
      if (mode === "create") {
        // Si hay usuario autenticado, pasar su id como tercer argumento
        const userId = currentUser?.id;
        result = await createLogicalTableRecord(tableId, values, userId);
        // Procesar notificaciones pendientes si existen y el registro fue creado
        if (pendingNotifications.length > 0 && result?.id) {
          await processPendingNotifications(result.id);
        }
      } else if (mode === "edit" && record) {
        // Pasar el userId como cuarto argumento si la función lo soporta
        const userId = currentUser?.id;
        result = await updateLogicalTableRecord(record.id, values, lastPosition, userId);
      }
      if (onSubmitSuccess) onSubmitSuccess(result);
      if (mode === "create") {
        const initialValues = {};
        columns.forEach((col) => {
          switch (col.data_type) {
            case "boolean":
              initialValues[col.name] = false;
              break;
            case "int":
            case "number":
              initialValues[col.name] = 0;
              break;
            case "file":
              initialValues[col.name] = null;
              break;
            case "file_array":
              initialValues[col.name] = [];
              break;
            default:
              initialValues[col.name] = "";
          }
        });
        setValues(initialValues);
        setErrors({});
      }
      onOpenChange?.(false);
    } catch (err) {
      console.log("chat: ERROR:", err);
      setSubmitError(err?.response?.data?.message || "Error al guardar el registro");
    } finally {
      setLoading(false);
    }
  }, [tableId, values, validate, onSubmitSuccess, columns, onOpenChange, mode, record, currentUser, lastPosition, pendingNotifications]);

  const handleOpenForeignModal = (col) => {
    const interTable = tables.find(t =>
      (t.original_table_id === tableId && t.foreign_table_id === col.foreign_table_id) ||
      (t.original_table_id === col.foreign_table_id && t.foreign_table_id === tableId)
    );
    setcolumnName(col);
    //solo para que esté abierto un modal!
    setRelatedTableModalOpen(false);
    setFileModalOpen(false);

    setForeignModalOpen(true);
    setForeignModalColumn(col);
    setIntermediateTableId(interTable ? interTable.id : null);
  };

  // Detectar columnas de notificaciones y cargar usuarios asignados
  useEffect(() => {
    if (columns.length > 0) {
      // Verificar si la tabla tiene columnas de fecha (funcionalidad de notificaciones)
      const hasDateColumns = columns.some(col =>
        ['date', 'datetime', 'timestamp'].includes(col.data_type)
      );
      setHasNotificationColumns(hasDateColumns);

      // Si estamos editando un registro y la tabla tiene notificaciones, cargar usuarios asignados
      if (hasDateColumns && mode === "edit" && record?.id) {
        loadAssignedUsers();
      }
    }
  }, [columns, mode, record]);

  // Función para cargar usuarios asignados
  const loadAssignedUsers = async () => {
    try {
      const users = await getAssignedUsersByRecord(record.id);
      setAssignedUsers(users || []);
    } catch (error) {
      console.error('Error loading assigned users:', error);
      setAssignedUsers([]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-10 bg-black/30 flex items-start justify-center px-4 py-28">
      <div
        className={`bg-white rounded-lg shadow-lg ${(foreignModalOpen || relatedTableModalOpen || fileModalOpen)
          ? "w-1/2" : "w-full max-w-[1150px]"
          } relative z-10 flex flex-col overflow-hidden h-[80vh]`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold">
            {mode === "create" ? "Nuevo Registro" : "Editar Registro"}
          </h2>
          <button
            onClick={handleAttemptClose} //onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
          {/* Botón para ver historial de cambios (solo en modo edición) */}
          {mode === "edit" && record?.id && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAuditLogModal(true)}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Ver Cambios
            </Button>
          )}
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto px-4 py-2 flex-1">
          {columns.length === 0 ? (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center">
              <Plus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h4 className="font-medium mb-2">No hay columnas definidas</h4>
              <p className="text-sm mb-4">Esta tabla no tiene columnas configuradas.</p>
              <Button
                type="button"
                onClick={() => {
                  // Redirigir o abrir el modal de creación de columna
                  if (window && window.location) {
                    window.location.href = `/columns?tableId=${tableId}`;
                  }
                }}
                className="mb-2"
              >
                Crear columna
              </Button>
              <p className="text-xs text-gray-400">Agrega columnas para empezar a usar la tabla.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {columns.map((col) => {
                if (foreignForm && col.name === "original_record_id") return null;
                return (
                  <div key={col.column_id} className="space-y-2">
                    <Label htmlFor={`field-${col.name}`}>
                      {col.name.endsWith('_id') ? col.foreign_column_name : col.name}
                      {col.is_required && (
                        <Badge className="ml-1 text-xs text-destructive bg-transparent">
                          *Requerido
                        </Badge>
                      )}
                    </Label>
                    {col.data_type === "foreign" ? (
                      <Button
                        type="button"
                        onClick={() => handleOpenForeignModal(col)}
                      >
                        Abrir tabla
                      </Button>
                    ) : col.data_type === "tabla" ? (
                      <Button
                        type="button"
                        onClick={() => handleOpenRelatedTableModal(col)}
                      >
                        Abrir tabla relacionada
                      </Button>
                    ) : col.data_type === "file_array" ? (
                      <Button type="button" onClick={() => handleOpenFileModal(col)}>
                        Gestionar Archivos
                      </Button>
                      // ----------------------------
                    ) : (
                      <FieldRenderer
                        colName={colName?.foreign_column_name}
                        id={`field-${col.name}`}
                        column={col}
                        value={values[col.name]}
                        onChange={(e) =>
                          handleChange(
                            col.name,
                            e.target.type === "checkbox"
                              ? e.target.checked
                              : e.target.value
                          )
                        }
                        error={errors[col.name]}
                      />
                    )}
                    {errors[col.name] && (
                      <div className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors[col.name]}
                      </div>
                    )}
                  </div>
                );
              })}
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
            </form>
          )}
        </div>

        <ConfirmationDialog
          open={showExitConfirm}
          onClose={() => setShowExitConfirm(false)}
          title="¿Salir sin guardar?"
          message="Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar este formulario?"
          actions={[
            { label: "Cancelar", onClick: () => setShowExitConfirm(false), variant: "default" },
            {
              label: "Salir sin guardar",
              onClick: () => {
                setShowExitConfirm(false);
                setIsDirty(false);
                onOpenChange(false);
              },
              variant: "outline"
            }
          ]}
        />


        {/* Footer con botones */}
        <div className="border-t p-4 flex gap-2 justify-between">
          <div className="flex gap-2">
            <Button type="submit" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>Guardar</>
              )}
            </Button>
            {mode === "edit" && onDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onDelete(record)}
                disabled={loading}
              >
                Eliminar
              </Button>
            )}
          </div>

          {/* Botón de usuarios asignados - solo si es modo edición y hay notificaciones */}
          {mode === "edit" && record?.id && (
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await loadAssignedUsers();
                setShowAssignedUsersModal(true);
              }}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Usuarios Asignados ({assignedUsers.length})
            </Button>
          )}
        </div>
      </div>

      {/* Modal de tabla relacionada (tipo foreign) */}
      {foreignModalOpen && (
        <div className="bg-white rounded-lg shadow-lg w-[900px] min-h-[80vh] overflow-y-auto p-4 ml-4 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {foreignModalColumn
                ? `Registros relacionados de ${foreignModalColumn.foreign_table_name || foreignModalColumn.name || "Tabla intermedia"
                // foreignModalColumn.foreign_table_name || "Tabla intermedia"
                }`
                : "Registros relacionados"}
            </h2>
            <button
              onClick={() => {
                if (isDirty) {
                  setShowExitConfirm(true);
                } else {
                  onOpenChange(false);
                }
              }}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Cerrar modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {foreignModalColumn && intermediateTableId && (
            <LogicalTableDataView
              tableId={intermediateTableId}
              colName={columnName}
              constFilter={{
                column: "original_record_id",
                condition: "equals",
                value: columnName?.column_id ?? "",
              }}
              hiddenColumns={["original_record_id"]}
              forcePermissions={{
                can_create: true,
                can_read: true,
                can_update: true,
                can_delete: true
              }}
            />
          )}
        </div>
      )}

      {/* Modal de tabla relacionada (tipo tabla) */}
      {relatedTableModalOpen && relatedTableModalColumn && (
        <div className="bg-white rounded-lg shadow-lg w-[900px] min-h-[80vh] overflow-y-auto p-4 ml-4 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {relatedTableModalColumn.related_table_name
                ? `Registros de ${relatedTableModalColumn.related_table_name}`
                : "Registros de tabla relacionada"}
            </h2>
            <button
              onClick={() => setRelatedTableModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Cerrar modal relacionada"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {relatedTableModalColumn.foreign_table_id && (
            <LogicalTableDataView
              tableId={relatedTableModalColumn.foreign_table_id}
              forcePermissions={{
                can_create: true,
                can_read: true,
                can_update: true,
                can_delete: true
              }}
            />
          )}
        </div>
      )}
      {/* Modal de usuarios asignados */}
      {showAssignedUsersModal && mode === "edit" && record?.id && (
        <div className="fixed inset-0 z-15 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Usuarios Asignados por Notificaciones
              </h2>
              <button
                onClick={() => setShowAssignedUsersModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Cerrar modal de usuarios"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <AssignedUsersCell
                value={assignedUsers}
                onChange={() => {
                  // Recargar usuarios asignados después de cambios
                  loadAssignedUsers();
                }}
                tableId={tableId}
                recordId={record.id}
                isEditing={true}
                className="w-full"
              />
            </div>

            <div className="border-t p-4 flex justify-end">
              <Button
                onClick={() => setShowAssignedUsersModal(false)}
                variant="outline"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de historial de cambios */}
      {showAuditLogModal && record?.id && (
        <AuditLogModal
          open={showAuditLogModal}
          onClose={setShowAuditLogModal}
          recordId={record.id}
          tableName={record.table_name || ""}
        />
      )}

      {/* Modal de gestion de archivos */}
      {fileModalOpen && fileModalColumn && (
        <div className="bg-white rounded-lg shadow-lg w-1/2 h-[80vh] p-4 ml-4 relative z-10 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              Gestionar Archivos de "{fileModalColumn.name}"
            </h2>
            <button
              onClick={() => setFileModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Cerrar modal de archivos"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            <FileUpload
              multiple={true}
              value={values[fileModalColumn.name]}
              onChange={(newFileValue) => {
                handleChange(fileModalColumn.name, newFileValue);
              }}
              error={errors[fileModalColumn.name]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para mostrar y crear columnas en la tabla relacionada
function RelatedTableContent({ tableId }) {
  const [columns, setColumns] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const cols = await getLogicalTableStructure(tableId);
        setColumns(cols);
      } catch {
        setColumns([]);
      }
    })();
  }, [tableId]);

  if (columns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 flex flex-col items-center">
        <Plus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <h4 className="font-medium mb-2">No hay columnas definidas</h4>
        <p className="text-sm mb-4">Esta tabla no tiene columnas configuradas.</p>
        <Button
          type="button"
          onClick={() => {
            if (window && window.location) {
              window.location.href = `/columns?tableId=${tableId}`;
            }
          }}
          className="mb-2"
        >
          Crear columna
        </Button>
        <p className="text-xs text-gray-400">Agrega columnas para empezar a usar la tabla.</p>
      </div>
    );
  }
  return (
    <LogicalTableDataView
      tableId={tableId}
      forcePermissions={{
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true
      }}
    />
  );
}
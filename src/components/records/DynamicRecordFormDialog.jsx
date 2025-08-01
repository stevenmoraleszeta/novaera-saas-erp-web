"use client";

import React, { useState, useEffect, useCallback } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import {
  getLogicalTableStructure,
  createLogicalTableRecord,
  updateLogicalTableRecord,
  getLogicalTableRecords,
  validateUniqueValue,
} from "@/services/logicalTableService";
import FieldRenderer from "../common/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle, Users, History, MessageCircle, X, XIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import LogicalTableDataView from "@/components/tables/LogicalTableDataView";
import AssignedUsersSelector from "./AssignedUsersSelector";
import AuditLogModal from "./AuditLogModal";
import RecordComments from "./RecordComments";
import { getAssignedUsersByRecord } from "@/services/recordAssignedUsersService";
import { getCommentsCount } from "@/services/recordCommentsService";
import axios from "@/lib/axios";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { toast } from 'sonner';
import { setAssignedUsersForRecord } from '@/services/recordAssignedUsersService';

import FileUpload from '@/components/common/FileUpload';
import scheduledNotificationsService from '@/services/scheduledNotificationsService';

import { useRouter } from "next/navigation";
import useTabStore from "@/stores/tabStore";

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
  defaultValues,
  isChildModal = false
}) {
  
  const router = useRouter();  
  const { addModuleTab, navigateToTab } = useTabStore();
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
  const [preProcessedRecords, setPreProcessedRecords] = useState(null); // Para almacenar registros procesados

  const [showAssignedUsersModal, setShowAssignedUsersModal] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [hasNotificationColumns, setHasNotificationColumns] = useState(false);
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showUniqueErrorDialog, setShowUniqueErrorDialog] = useState(false);
  const [uniqueErrorInfo, setUniqueErrorInfo] = useState({ fieldName: '', value: '' });

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
    console.log('Procesando notificaciones pendientes:', pendingNotifications);

    for (const notif of pendingNotifications) {
      try {
        await scheduledNotificationsService.createScheduledNotification({
          table_id: parseInt(tableId),
          record_id: parseInt(newRecordId),
          column_id: notif.columnId,
          target_date: notif.targetDate,
          notification_title: notif.title,
          notification_message: notif.message,
          notify_before_days: notif.notify_before_days || 0,
          assigned_users: notif.assigned_users || []
        });

        // Si hay usuarios asignados, también asignarlos al registro
        if (notif.assigned_users && notif.assigned_users.length > 0) {
          await setAssignedUsersForRecord(newRecordId, notif.assigned_users);
        }

        console.log('Notificación creada exitosamente:', notif);
      } catch (error) {
        console.error('Error enviando notificación pendiente:', error);
        toast.error(`Error al crear notificación: ${notif.title}`);
      }
    }

    // Limpiar notificaciones pendientes después de procesarlas
    setPendingNotifications([]);

    if (pendingNotifications.length > 0) {
      toast.success(`${pendingNotifications.length} notificación(es) creada(s) exitosamente`);
    }
  };

  // Función para agregar notificaciones pendientes
  const handleAddPendingNotification = (columnId, targetDate, title, message, notify_before_days, assigned_users) => {
    setPendingNotifications(prev => [
      ...prev,
      {
        columnId,
        targetDate,
        title,
        message,
        notify_before_days: notify_before_days || 0,
        assigned_users: assigned_users || []
      }
    ]);
  };

  // Función para remover notificaciones pendientes
  const handleRemovePendingNotification = (columnId) => {
    setPendingNotifications(prev =>
      prev.filter(notif => notif.columnId !== columnId)
    );
  };

  // Obtener usuario autenticado
  const currentUser = useCurrentUser();

  // Función para cargar el texto correspondiente a un ID foráneo
  const loadForeignDisplayText = async (column, recordId) => {
    try {
      if (!recordId) return '';
      
      // Primero, verificar si estamos trabajando con una tabla intermedia
      if (intermediateTableId) {
        // Obtener el registro de la tabla intermedia
        const intermediateRecords = await getLogicalTableRecords(intermediateTableId);
        const intermediateRecord = intermediateRecords.find(r => r.id === parseInt(recordId));
        
        if (intermediateRecord && intermediateRecord.record_data?.foreign_record_id) {
          // Es una tabla intermedia, obtener el texto del registro foráneo real
          const foreignRecordId = intermediateRecord.record_data.foreign_record_id;
          
          if (column.foreign_table_id && foreignRecordId) {
            const foreignRecords = await getLogicalTableRecords(column.foreign_table_id);
            const foreignRecord = foreignRecords.find(r => r.id === parseInt(foreignRecordId));
            
            if (foreignRecord) {
              const foreignColumnName = column.foreign_column_name || 'name';
              return foreignRecord.record_data?.[foreignColumnName] || 
                     foreignRecord[foreignColumnName] || 
                     foreignRecord.name || 
                     `Registro ${foreignRecordId}`;
            }
          }
        }
      }
      
      // Si no es tabla intermedia o no se encontró, usar la lógica original
      if (!column.foreign_table_id) return '';
      
      // Obtener todos los registros de la tabla foránea
      const records = await getLogicalTableRecords(column.foreign_table_id);
      
      // Buscar el registro correspondiente al ID
      const foreignRecord = records.find(r => r.id === parseInt(recordId));
      
      if (!foreignRecord) return '';
      
      // Obtener el texto usando la misma lógica que en el modal
      const foreignColumnName = column.foreign_column_name || 'name';
      const textValue = foreignRecord.record_data?.[foreignColumnName] || 
                       foreignRecord[foreignColumnName] || 
                       foreignRecord.name || 
                       `Registro ${recordId}`;
      
      return textValue;
    } catch (error) {
      console.error('Error cargando texto foráneo:', error);
      return '';
    }
  };

  useEffect(() => {
    if (!tableId || !open) return;
    (async () => {
      try {
        const cols = await getLogicalTableStructure(tableId);
        setColumns(cols);
        const initialValues = {};
        
        // Procesar cada columna
        for (const col of cols) {
          if (foreignForm && col.name === "original_record_id") {
            initialValues[col.name] = colName.column_id;
            continue;
          }
          
          if (mode === "edit" && record?.record_data?.[col.name] !== undefined) {
            const value = castValueByDataType(col.data_type, record.record_data[col.name]);
            initialValues[col.name] = value;
            
            // Si es una columna foránea y tiene un valor, cargar el texto correspondiente
            if ((col.data_type === "foreign" || col.data_type === "tabla") && value) {
              const displayText = await loadForeignDisplayText(col, value);
              if (displayText) {
                initialValues[col.name + '_display'] = displayText;
              }
            }
          } else {
            // Valores por defecto según el tipo de dato
            switch (col.data_type) {
              case "boolean":
                initialValues[col.name] = defaultValues?.[col.name] || false;
                break;
              case "integer":
              case "number":
                initialValues[col.name] = defaultValues?.[col.name] || 0;
                break;
              case "file":
                initialValues[col.name] = null;
                break;
              case "file_array":
                initialValues[col.name] = [];
                break;
              default:
                initialValues[col.name] = defaultValues?.[col.name] || "";
            }
          }
        }
        
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
      loadCommentsCount();
    }
  }, [open, mode, record]);

  // Función para cargar conteo de comentarios
  const loadCommentsCount = async () => {
    try {
      const count = await getCommentsCount(record.id);
      setCommentsCount(count);
    } catch (error) {
      console.error('Error loading comments count:', error);
      setCommentsCount(0);
    }
  };

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

  const validate = useCallback(async () => {
    const errs = {};
    
    for (const col of columns) {
      const currentValue = values[col.name];

      if (col.is_required && (currentValue === "" || currentValue == null)) {
        errs[col.name] = "Este campo es requerido";
        continue; // Pasa a la siguiente columna
      }

      if (col.is_unique && currentValue) {
        try {
          const response = await validateUniqueValue(
            tableId,
            col.name,
            currentValue,
            mode === "edit" ? record.id : null
          );
          const isValueUnique = response.data.isUnique; 

          if (isValueUnique === false) {
            setUniqueErrorInfo({
              fieldName: col.foreign_column_name || col.name,
              value: currentValue
            });
            setShowUniqueErrorDialog(true);
            return false;
          }
        } catch (error) {

          console.error("Error validando campo único:", error);
          errs[col.name] = "No se pudo verificar la unicidad.";
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [columns, values, tableId, mode, record]);

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

  const saveRecord = useCallback(async () => {
    setSubmitError(null);

    const isValid = await validate();
    if (!isValid) return;
    setLoading(true);

    try {
      let result;
      const userId = currentUser?.id;
      
      // Filtrar los valores para enviar solo los campos reales (no los _display)
      const cleanValues = {};
      Object.keys(values).forEach(key => {
        if (!key.endsWith('_display')) {
          cleanValues[key] = values[key];
        }
      });
      
      if (mode === "create") {
        const userId = currentUser?.id;
        result = await createLogicalTableRecord(tableId, cleanValues, userId);

        if (pendingNotifications.length > 0 && result?.id) {
          console.log('Registro creado con ID:', result.id, 'Procesando notificaciones...');
          await processPendingNotifications(result.id);
        }
      } else if (mode === "edit" && record) {
        const userId = currentUser?.id;
        result = await updateLogicalTableRecord(record.id, cleanValues, lastPosition, userId);
      }

      if (onSubmitSuccess) onSubmitSuccess(result);

      if (mode === "create") {
        // Reset form values
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
        setIsDirty(false);
      }
      onOpenChange?.(false);
    } catch (err) {
      console.log("ERROR:", err);
      setSubmitError(err?.response?.data?.message || "Error al guardar el registro");
    } finally {
      setLoading(false);
    }
  }, [
    tableId,
    values,
    validate,
    onSubmitSuccess,
    columns,
    onOpenChange,
    mode,
    record,
    currentUser,
    lastPosition,
    pendingNotifications
  ]);


  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await saveRecord();
    },
    [saveRecord]
  );


  const handleOpenForeignModal = async (col) => {
    console.log('🚀 Abriendo modal foráneo para columna:', col);
    
    const interTable = tables.find(t =>
      (t.original_table_id === tableId && t.foreign_table_id === col.foreign_table_id) ||
      (t.original_table_id === col.foreign_table_id && t.foreign_table_id === tableId)
    );
    
    console.log('📋 Tabla intermedia encontrada:', interTable);
    
    setcolumnName(col);
    //solo para que esté abierto un modal!
    setRelatedTableModalOpen(false);
    setFileModalOpen(false);
    
    // Limpiar registros procesados anteriores
    setPreProcessedRecords(null);

    setForeignModalOpen(true);
    setForeignModalColumn(col);
    setIntermediateTableId(interTable ? interTable.id : null);
    
    // Pre-procesar datos si hay tabla intermedia
    if (interTable?.id) {
      console.log('🔄 Pre-procesando datos para tabla intermedia ID:', interTable.id);
      
      try {
        // Obtener la estructura de la tabla intermedia
        const intermediateTableStructure = await getLogicalTableStructure(interTable.id);
        console.log('📊 Estructura de tabla intermedia:', intermediateTableStructure);
        
        // Obtener los registros de la tabla intermedia
        const intermediateRecords = await getLogicalTableRecords(interTable.id);
        console.log('📝 Registros de tabla intermedia (sin procesar):', intermediateRecords);
        
        const processedRecords = [];
        for (const record of intermediateRecords) {
          const processedRecord = { ...record };
          
          if (record.record_data?.foreign_record_id) {
            
            try {
              if (col.foreign_table_id) {
                const foreignRecords = await getLogicalTableRecords(col.foreign_table_id);
                const foreignRecord = foreignRecords.find(r => r.id === parseInt(record.record_data.foreign_record_id));
                
                if (foreignRecord) {
                  const foreignColumnName = col.foreign_column_name || 'name';
                  const displayText = foreignRecord.record_data?.[foreignColumnName] || 
                                    foreignRecord[foreignColumnName] || 
                                    foreignRecord.name || 
                                    `Registro ${record.record_data.foreign_record_id}`;
                  
                  
                  processedRecord.record_data = {
                    ...processedRecord.record_data,
                    foreign_record_id: displayText
                  };
                }
              }
            } catch (error) {
              console.error(' Error procesando foreign_record_id:', error);
            }
          }
          
          processedRecords.push(processedRecord);
        }
        
        console.log('🎉 Registros procesados para tabla intermedia:', processedRecords);
        
        // Almacenar los registros procesados
        setPreProcessedRecords(processedRecords);
        
      } catch (error) {
        console.error('💥 Error pre-procesando datos de tabla intermedia:', error);
      }
    }
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

  const handleRedirect = (col, recordId) => {
    if (!recordId || !col.foreign_table_id) return;
    const targetTable = tables.find(t => t.id === col.foreign_table_id);

    if (targetTable && targetTable.module_id) {
      const newTabId = addModuleTab(targetTable.module_id, targetTable.name || 'Módulo', recordId);
      
      if (newTabId) {
        navigateToTab(newTabId, router);
        onOpenChange(false); // Cierra el modal actual
      }
    } else {
      toast.error("No se pudo encontrar el módulo para la tabla de destino.");
    }
  };

  return (
    <div className={isChildModal
      ? "fixed inset-0 z-10 flex items-start justify-end px-4 py-28"
      : "fixed inset-0 z-10 bg-black/30 flex items-start justify-center px-4 py-28"
    }>
      <div
        className={`bg-white rounded-lg shadow-lg
          ${foreignModalOpen || relatedTableModalOpen || fileModalOpen
                  ? "w-1/2"
                  : isChildModal
                    ? "w-[50%]"  // ancho específico cuando isChildModal es true
                    : "w-full max-w-[1150px]"
                }
          relative z-0 flex flex-col overflow-hidden h-[80vh]`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold">
            {mode === "create" ? "Nuevo Registro" : "Editar Registro"}
          </h2>
          <button
            onClick={handleAttemptClose} //onClick={() => onOpenChange(false)}
            className="bg-black text-white ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            aria-label="Cerrar modal"
          >
            <XIcon />
          </button>
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
                const redirectHandler = 
                  (col.data_type === 'select' || col.data_type === 'user' || col.is_foreign_key)
                    ? () => handleRedirect(col, values[col.name])
                    : null;
                return (
                  <div key={col.column_id} className="space-y-2">
                    <Label htmlFor={`field-${col.name}`}>
                      {col.name.endsWith('_id') ? col.foreign_column_name : col.name}
                      {col.is_required && (
                        <Badge className="ml-1 text-xs text-destructive bg-transparent">
                          *Requerido
                        </Badge>
                      )}
                      {col.is_unique && (
                        <Badge className="ml-1 text-xs text-destructive bg-transparent">
                          *Único
                        </Badge>
                      )}
                    </Label>
                    {col.data_type === "foreign" ? (
                      <Button
                        type="button"
                        onClick={async () => await handleOpenForeignModal(col)}
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
                      <div className="space-y-2">
                        <FieldRenderer
                          colName={colName?.foreign_column_name}
                          id={`field-${col.name}`}
                          column={col}
                          value={values[col.name]}
                          onRedirectClick={
                            ((col.data_type === 'select' && col.foreign_table_id) || col.data_type === 'user')
                              ? () => handleRedirect(col, values[col.name])
                              : null
                          }
                          onChange={(e) =>
                            handleChange(
                              col.name,
                              e.target.type === "checkbox"
                                ? e.target.checked
                                : e.target.value
                            )
                          }
                          error={errors[col.name]}
                          // Agregar props para notificaciones si es campo de fecha
                          tableId={tableId}
                          recordId={record?.id}
                          pendingNotifications={pendingNotifications}
                          onAddPendingNotification={handleAddPendingNotification}
                          onRemovePendingNotification={handleRemovePendingNotification}
                        />
                        {/* Mostrar el texto seleccionado para campos foráneos */}
                        {(col.data_type === "foreign" || col.data_type === "tabla") && values[col.name + '_display'] && (
                          <div className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <strong>✓ Seleccionado:</strong> {values[col.name + '_display']}
                                <div className="text-xs text-green-600 mt-1">
                                  ID en BD: {values[col.name]}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleChange(col.name, "");
                                  handleChange(col.name + '_display', "");
                                }}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                Limpiar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
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
          message="Tienes cambios sin guardar. ¿Qué te gustaría hacer?"
          actions={[
            {
              label: "Guardar",
              onClick: async () => {
                await saveRecord();
                setShowExitConfirm(false);
                setIsDirty(false);
              },
              variant: "default"
            },
            {
              label: "No guardar",
              onClick: () => {
                setShowExitConfirm(false);
                setIsDirty(false);
                onOpenChange(false);
              },
              variant: "outline"
            },
          ]}
        />

        {/* Footer con botones */}
        <div className="border-t p-4 flex justify-between">
          {/* Izquierda: Guardar, Eliminar, Duplicar */}
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
            {mode === "edit" && record && (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    setLoading(true);
                    const { id, created_at, updated_at, ...restData } = record.record_data || {};
                    const newRecord = await createLogicalTableRecord(tableId, restData, currentUser?.id);
                    onOpenChange(false);
                    onSubmitSuccess?.(newRecord);
                  } catch (error) {
                    console.error("Error al duplicar registro:", error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                Duplicar
              </Button>
            )}
          </div>

          {/* Derecha: Comentarios, Usuarios Asignados y Ver Cambios */}
          <div className="flex gap-2">
            {mode === "edit" && record?.id && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCommentsModal(true)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Comentarios ({commentsCount})
              </Button>
            )}
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
        </div>

      </div>

      {/* Modal de tabla relacionada (tipo foreign) */}
      {foreignModalOpen && (
        <div className="bg-white rounded-lg shadow-lg w-1/2 min-h-[80vh] overflow-y-auto p-4 ml-4 relative z-0">
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
                setForeignModalOpen(false);
              }}
              className="bg-black text-white ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              aria-label="Cerrar modal"
            >
              <XIcon />
            </button>
          </div>
          {foreignModalColumn && intermediateTableId && (
            <LogicalTableDataView
              tableId={intermediateTableId}
              isChildModal={true}
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
              preProcessedRecords={preProcessedRecords} // Pasar registros pre-procesados
              key={`foreign-modal-${intermediateTableId}-${Date.now()}`} // Fuerza re-render
              onRowClick={async (selectedRecord) => {
                // Para tablas intermedias, necesitamos obtener el texto del registro foráneo
                let textValue = '';
                let recordIdToSave = selectedRecord.id;
                
                // Si el registro tiene foreign_record_id, obtener el texto del registro foráneo
                if (selectedRecord.record_data?.foreign_record_id) {
                  try {
                    // Obtener el registro foráneo real usando su ID
                    const foreignRecordId = selectedRecord.record_data.foreign_record_id;
                    
                    // Determinar la tabla foránea de donde obtener el texto
                    const foreignTableId = foreignModalColumn.foreign_table_id;
                    
                    if (foreignTableId && foreignRecordId) {
                      // Obtener todos los registros de la tabla foránea
                      const foreignRecords = await getLogicalTableRecords(foreignTableId);
                      
                      // Buscar el registro específico
                      const foreignRecord = foreignRecords.find(r => r.id === parseInt(foreignRecordId));
                      
                      if (foreignRecord) {
                        // Obtener el texto usando la columna especificada
                        const foreignColumnName = foreignModalColumn.foreign_column_name || 'name';
                        textValue = foreignRecord.record_data?.[foreignColumnName] || 
                                  foreignRecord[foreignColumnName] || 
                                  foreignRecord.name || 
                                  `Registro ${foreignRecordId}`;
                        
                        // Para tablas intermedias, guardamos el ID del registro intermedio
                        recordIdToSave = selectedRecord.id;
                      }
                    }
                  } catch (error) {
                    console.error('Error obteniendo texto del registro foráneo:', error);
                    textValue = `Registro ${selectedRecord.record_data.foreign_record_id}`;
                  }
                } else {
                  // Si no es tabla intermedia, usar la lógica original
                  const foreignColumnName = foreignModalColumn.foreign_column_name || 'name';
                  textValue = selectedRecord.record_data?.[foreignColumnName] || 
                            selectedRecord[foreignColumnName] || 
                            selectedRecord.name || 
                            `Registro ${selectedRecord.id}`;
                }
                
                // Guardar el ID para la relación en la base de datos (para integridad referencial)
                handleChange(foreignModalColumn.name, recordIdToSave);
                
                // También guardar el texto en una propiedad separada para mostrar en la UI
                handleChange(foreignModalColumn.name + '_display', textValue);
                
                // Cerrar el modal
                setForeignModalOpen(false);
                
                console.log('Registro seleccionado:', selectedRecord);
                console.log('ID guardado para BD:', recordIdToSave);
                console.log('Texto guardado para UI:', textValue);
                console.log('Tipo de relación:', selectedRecord.record_data?.foreign_record_id ? 'Tabla intermedia' : 'Relación directa');
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
              className="bg-black text-white ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              aria-label="Cerrar modal relacionada"
            >
              <XIcon />
            </button>
          </div>
          {relatedTableModalColumn.foreign_table_id && (
            <LogicalTableDataView
              tableId={relatedTableModalColumn.foreign_table_id}
              isChildModal={true}
              forcePermissions={{
                can_create: true,
                can_read: true,
                can_update: true,
                can_delete: true
              }}
              onRowClick={(selectedRecord) => {
                // Obtener el valor de texto de la primera columna visible del registro
                // Excluir columnas típicamente de ID y metadatos
                const excludeColumns = ['id', 'created_at', 'updated_at', 'table_id'];
                const recordData = selectedRecord.record_data || selectedRecord;
                
                // Buscar la primera columna que no sea un ID o timestamp
                let textValue = '';
                for (const [key, value] of Object.entries(recordData)) {
                  if (!excludeColumns.includes(key) && value !== null && value !== undefined) {
                    textValue = String(value);
                    break;
                  }
                }
                
                // Si no encontramos nada, usar 'name' como fallback o el ID
                if (!textValue) {
                  textValue = recordData.name || recordData.id || 'Registro seleccionado';
                }
                
                // Guardar el ID para la relación en la base de datos (para integridad referencial)
                handleChange(relatedTableModalColumn.name, selectedRecord.id);
                
                // También guardar el texto en una propiedad separada para mostrar en la UI
                handleChange(relatedTableModalColumn.name + '_display', textValue);
                
                // Cerrar el modal
                setRelatedTableModalOpen(false);
                
                console.log('Registro relacionado seleccionado:', selectedRecord);
                console.log('ID guardado para BD:', selectedRecord.id);
                console.log('Texto guardado para UI:', textValue);
              }}
            />
          )}
        </div>
      )}
      {/* Modal de usuarios asignados */}
      {showAssignedUsersModal && mode === "edit" && record?.id && (
        <div className="fixed inset-0 z-25 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Usuarios Asignados por Notificaciones
              </h2>
              <button
                onClick={() => setShowAssignedUsersModal(false)}
                className="bg-black text-white ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                aria-label="Cerrar modal de usuarios"
              >
                <XIcon />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <AssignedUsersSelector
                recordId={record.id}
                selectedUsers={assignedUsers}
                onChange={(updatedUserIds) => {
                  // Recargar usuarios asignados después de cambios
                  loadAssignedUsers();
                }}
                creationMode={false}
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

      {/* Modal de comentarios */}
      {showCommentsModal && record?.id && (
        <RecordComments
          recordId={record.id}
          tableId={tableId}
          isOpen={showCommentsModal}
          onClose={() => {
            setShowCommentsModal(false);
            // Recargar conteo de comentarios después de cerrar el modal
            loadCommentsCount();
          }}
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
              className="bg-black text-white ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              aria-label="Cerrar modal de archivos"
            >
              <XIcon />
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
      <ConfirmationDialog
      open={showUniqueErrorDialog}
      onClose={() => setShowUniqueErrorDialog(false)}
      title="Valor Duplicado"
      message={`El valor "${uniqueErrorInfo.value}" ya existe en el campo "${uniqueErrorInfo.fieldName}". Este campo debe ser único.`}
      actions={[
        {
          label: "Entendido",
          onClick: () => setShowUniqueErrorDialog(false),
          variant: "default"
        }
      ]}
    />
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
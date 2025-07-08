"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  getLogicalTableStructure,
  createLogicalTableRecord,
  updateLogicalTableRecord,
  getLogicalTableRecords,
} from "@/services/logicalTableService";
import FieldRenderer from "../common/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle, GripVertical, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import LogicalTableDataView from "@/components/tables/LogicalTableDataView";
import axios from "@/lib/axios";
import scheduledNotificationsService from '@/services/scheduledNotificationsService';
import { setAssignedUsersForRecord } from '@/services/recordAssignedUsersService';

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
  const [createdRecordId, setCreatedRecordId] = useState(null);
  
  // Estados para funcionalidad draggable
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);
  const dragHandleRef = useRef(null);

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
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      let result;
      if (mode === "create") {
        result = await createLogicalTableRecord(tableId, values);
      } else if (mode === "edit" && record) {
        result = await updateLogicalTableRecord(record.id, values, lastPosition);

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
  }, [tableId, values, validate, onSubmitSuccess, columns, onOpenChange, mode, record]);

  const handleOpenForeignModal = (col) => {
    const interTable = tables.find(t =>
      (t.original_table_id === tableId && t.foreign_table_id === col.foreign_table_id) ||
      (t.original_table_id === col.foreign_table_id && t.foreign_table_id === tableId)
    );
    setcolumnName(col);
    setForeignModalOpen(true);
    setForeignModalColumn(col);
    setIntermediateTableId(interTable ? interTable.id : null);
  };

  // Funciones para manejar notificaciones pendientes
  const addPendingNotification = useCallback((columnId, targetDate, title, message, notifyBeforeDays, assignedUsers) => {
    setPendingNotifications(prev => [...prev, {
      columnId,
      targetDate,
      title,
      message,
      notifyBeforeDays,
      assignedUsers
    }]);
  }, []);

  const removePendingNotification = useCallback((index) => {
    setPendingNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Funciones para manejar el drag
  const handleMouseDown = useCallback((e) => {
    if (!dragHandleRef.current?.contains(e.target)) return;
    setIsDragging(true);
    const rect = modalRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    // Limitar el movimiento dentro de la ventana
    const maxX = window.innerWidth - (modalRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (modalRef.current?.offsetHeight || 0);
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Event listeners para el drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Reset position cuando se abre el modal
  useEffect(() => {
    if (open) {
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 overflow-hidden">
      <div className="absolute inset-0">
        <div
          ref={modalRef}
          className={`bg-white rounded-lg shadow-lg ${
            foreignModalOpen ? "w-full max-w-lg sm:max-w-2xl md:max-w-4xl" : "w-full max-w-2xl sm:max-w-4xl md:max-w-6xl"
          } flex flex-col max-h-[calc(100vh-4rem)] ${isDragging ? 'cursor-move shadow-2xl' : 'shadow-lg'} transition-shadow duration-200`}
          style={{
            position: 'absolute',
            left: position.x || '50%',
            top: position.y || '2rem',
            transform: position.x === 0 && position.y === 0 ? 'translateX(-50%)' : 'none',
            minHeight: '300px',
            maxHeight: 'calc(100vh - 4rem)'
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Header - Siempre visible y fijo */}
          <div
            ref={dragHandleRef}
            className="flex justify-between items-center p-3 sm:p-4 border-b bg-gray-50 rounded-t-lg cursor-move flex-shrink-0 hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <h2 className="text-lg sm:text-xl font-bold">
                {mode === "create" ? "Nuevo Registro" : "Editar Registro"}
              </h2>
              <span className="text-xs text-gray-400 hidden sm:inline">(Arrastra para mover)</span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Contenido con scroll - Entre header y footer */}
          <div className="overflow-y-auto px-3 sm:px-6 py-4 flex-1 min-h-0">
            {columns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Plus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h4 className="font-medium mb-2">No hay columnas definidas</h4>
                <p className="text-sm">Esta tabla no tiene columnas configuradas</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {columns.map((col) => {
                  if (foreignForm && col.name === "original_record_id") return null;
                  return (
                    <div key={col.column_id} className="space-y-2">
                      <Label htmlFor={`field-${col.name}`}>
                        {col.name}
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
                          tableId={tableId}
                          recordId={record?.id}
                          isEditing={mode === "edit"}
                          pendingNotifications={pendingNotifications}
                          onAddPendingNotification={addPendingNotification}
                          onRemovePendingNotification={removePendingNotification}
                          createdRecordId={createdRecordId}
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

          {/* Footer con botones - Siempre visible y fijo */}
          <div className="border-t p-3 sm:p-4 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            {mode === "edit" && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(record)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Eliminar
              </Button>
            )}
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  {mode === "create" ? "Crear" : "Guardar"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de tabla relacionada */}
      {foreignModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/40 overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto">
            <div className="min-h-full flex items-start justify-center p-4 pt-16">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg sm:max-w-3xl md:max-w-5xl flex flex-col max-h-[calc(100vh-8rem)] mb-16">
                <div className="flex justify-between items-center p-3 sm:p-4 border-b bg-gray-50">
                  <h2 className="text-lg sm:text-xl font-bold">
                    {foreignModalColumn
                      ? `Registros relacionados de ${
                          foreignModalColumn.foreign_table_name || "Tabla intermedia"
                        }`
                      : "Registros relacionados"}
                  </h2>
                  <button
                    onClick={() => setForeignModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 transition-colors"
                    aria-label="Cerrar modal relacionado"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <div className="overflow-y-auto flex-1 p-2 sm:p-4">
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
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

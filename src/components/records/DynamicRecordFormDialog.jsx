"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getLogicalTableStructure,
  createLogicalTableRecord,
  updateLogicalTableRecord,
  getLogicalTableRecords,
} from "@/services/logicalTableService";
import FieldRenderer from "../common/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import LogicalTableDataView from "@/components/tables/LogicalTableDataView";
import axios from "@/lib/axios";
import { X } from "lucide-react";

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

  if (!open) return null;

return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center px-4 py-28">
      <div
        className={`bg-white rounded-lg shadow-lg ${
          foreignModalOpen ? "w-[90vw] max-w-[900px]" : "w-[95vw] max-w-[1150px]"
        } relative z-10 flex flex-col overflow-hidden h-[80vh]`}
      >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-2xl font-bold">
          {mode === "create" ? "Nuevo Registro" : "Editar Registro"}
        </h2>
        <button
          onClick={() => onOpenChange(false)}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Cerrar modal"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Scrollable form */}
      <div className="overflow-y-auto px-4 py-2 flex-1">
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

      {/* Footer con botones */}
      <div className="border-t p-4 flex gap-2 justify-start">
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
    </div>

    {/* Modal de tabla relacionada */}
    {foreignModalOpen && (
      <div className="bg-white rounded-lg shadow-lg w-[900px] min-h-[80vh] overflow-y-auto p-4 ml-4 relative z-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {foreignModalColumn
              ? `Registros relacionados de ${
                  foreignModalColumn.foreign_table_name || "Tabla intermedia"
                }`
              : "Registros relacionados"}
          </h2>
          <button
            onClick={() => setForeignModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar modal relacionado"
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
          />
        )}
      </div>
    )}
  </div>
);

}
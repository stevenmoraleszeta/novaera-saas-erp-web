import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getLogicalTableStructure,
  createLogicalTableRecord,
  updateLogicalTableRecord, // <--- debe existir en tu service
  getLogicalTableRecords,
} from "@/services/logicalTableService";
import FieldRenderer from "../common/FieldRenderer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import Table from "@/components/tables/Table";
import LogicalTableDataView from "@/components/tables/LogicalTableDataView";
import { useLogicalTables } from "@/hooks/useLogicalTables";
import axios from "@/lib/axios";

export default function DynamicRecordFormDialog({
  open = false,
  onOpenChange,
  tableId,
  mode = "create", // "create" | "edit"
  record = null, // objeto con datos a editar en modo edit
  onSubmitSuccess,
  onDelete,
  colName,
  foreignForm = false,
}) {
  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [foreignModalOpen, setForeignModalOpen] = useState(false);
  const [foreignModalColumn, setForeignModalColumn] = useState(null);
  const [foreignTableColumns, setForeignTableColumns] = useState([]);
  const [foreignTableData, setForeignTableData] = useState([]);
  const [foreignTableLoading, setForeignTableLoading] = useState(false);
  const [foreignTableError, setForeignTableError] = useState(null);
  const [intermediateTableId, setIntermediateTableId] = useState(null);
  const [columnName, setcolumnName] = useState(null);
  const [tables, setTables] = useState([]);


  // Carga columnas y valores iniciales según modo y record
  useEffect(() => {
    if (!tableId || !open) return;

    (async () => {
      try {
        const cols = await getLogicalTableStructure(tableId);
        setColumns(cols);

        const initialValues = {};
          cols.forEach((col) => {
            // Si estamos en modo foreignForm y es original_record_id, asignar el valor automático
            if (foreignForm && col.name === "original_record_id") {
              initialValues[col.name] = colName.column_id;
              return;
            }

            if (mode === "edit" && record?.record_data?.[col.name] !== undefined) {
              const rawValue = record.record_data[col.name];
              initialValues[col.name] = castValueByDataType(col.data_type, rawValue);
            } else {
              initialValues[col.name] =
                col.data_type === "boolean"
                  ? false
                  : col.data_type === "int" || col.data_type === "number"
                  ? 0
                  : "";
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
    // Solo cargar una vez al montar el componente
    (async () => {
      try {
        const res = await axios.get("/tables");
        setTables(res.data);
      } catch (err) {
        setTables([]);
      }
    })();
  }, []);

    function castValueByDataType(type, value) {
    if (value === null || value === undefined) return value;

    switch (type) {
      case "int":
      case "integer":
      case "number":
        return parseInt(value, 10);

      case "float":
      case "decimal":
      case "double":
        return parseFloat(value);

      case "boolean":
        return Boolean(value);

      case "user":
        return typeof value === "string" ? value : value?.id ?? "";

      case "date":
      case "datetime":
      case "timestamp":
        return typeof value === "string" ? value : new Date(value).toISOString().slice(0, 16);

      default:
        return value;
    }
  }

  // Validación simple
  const validate = useCallback(() => {
    const errs = {};
    columns.forEach((col) => {
      if (
        col.is_required &&
        (values[col.name] === "" || values[col.name] == null)
      ) {
        errs[col.name] = "Este campo es requerido";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [columns, values]);

  const handleChange = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined })); // Clear error when changing
  }, []);

  const handleDelete = () => {
    if (onDelete && record && !loading) {
      onDelete(record);
      onOpenChange?.(false);
    }
  };


  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitError(null);
      console.log("dirt: values = ", values)
      if (!validate()) return;

      setLoading(true);
      try {
        let result;
        if (mode === "create") {
          result = await createLogicalTableRecord(tableId, values);
        } else if (mode === "edit" && record) {
          result = await updateLogicalTableRecord( record.id, values);
        }

        if (onSubmitSuccess) onSubmitSuccess(result);

        // Reset form solo en creación (o cerrar)
        if (mode === "create") {
          const initialValues = {};
          columns.forEach((col) => {
            initialValues[col.name] = col.data_type === "boolean" ? false : "";
          });
          setValues(initialValues);
          setErrors({});
        }
        onOpenChange?.(false);
      } catch (err) {
        setSubmitError(
          err?.response?.data?.message || "Error al guardar el registro"
        );
      } finally {
        setLoading(false);
      }
    },
    [tableId, values, validate, onSubmitSuccess, columns, onOpenChange, mode, record]
  );

  const handleCancel = () => {
    if (!loading) {
      onOpenChange?.(false);
    }
  };

  useEffect(() => {
    if (!foreignModalOpen || !foreignModalColumn?.foreign_table_id) return;
    setForeignTableLoading(true);
    setForeignTableError(null);
    (async () => {
      try {
        const cols = await getLogicalTableStructure(foreignModalColumn.foreign_table_id);
        const data = await getLogicalTableRecords(foreignModalColumn.foreign_table_id);
        // Adapt columns to Table's expected format (key, header)
        const tableCols = cols.map(col => ({ key: col.name, header: col.name }));
        setForeignTableColumns(tableCols);
        setForeignTableData(data);
      } catch (err) {
        setForeignTableError("Error al cargar la tabla intermedia");
      } finally {
        setForeignTableLoading(false);
      }
    })();
  }, [foreignModalOpen, foreignModalColumn]);

  const handleOpenForeignModal = (col) => {
    console.log("dirt: columna clikeada:", col)
    const interTable = tables.find(
      t =>
        (t.original_table_id === tableId && t.foreign_table_id === col.foreign_table_id) ||
        (t.original_table_id === col.foreign_table_id && t.foreign_table_id === tableId)
    );
    setcolumnName(col);
    setForeignModalOpen(true);
    setForeignModalColumn(col);
    setIntermediateTableId(interTable ? interTable.id : null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Nuevo Registro" : "Editar Registro"}
            </DialogTitle>
          </DialogHeader>

          {!tableId ? (
            <div className="text-center py-8 text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h4 className="font-medium mb-2">Selecciona una tabla</h4>
              <p className="text-sm">Elige una tabla para agregar registros</p>
            </div>
          ) : columns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h4 className="font-medium mb-2">No hay columnas definidas</h4>
              <p className="text-sm">Esta tabla no tiene columnas configuradas</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col h-full"
            >
              <div className="flex-1 space-y-6 overflow-y-auto pr-1">
              {columns.map((col) => {
                // Si es original_record_id y estamos en foreignForm, no mostrar
                if (foreignForm && col.name === "original_record_id") return null;

                return (
                  <div key={col.column_id} className="space-y-2">
                    <Label htmlFor={`field-${col.name}`}>
                      {col.name}
                      {col.is_required && (
                        <Badge className="ml-auto text-xs text-destructive bg-transparent">
                          *Requerido
                        </Badge>
                      )}
                    </Label>
                    {col.data_type === "foreign" ? (
                      <Button type="button" onClick={() => handleOpenForeignModal(col)}>
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
              </div>

              {/* Botones fuera del scroll */}
              <div className="flex gap-2 pt-4 border-t mt-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 max-w-40"
                >
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
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 max-w-40"
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={foreignModalOpen} onOpenChange={setForeignModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {foreignModalColumn
                ? `Registros relacionados de ${foreignModalColumn.foreign_table_name || 'Tabla intermedia'}`
                : 'Registros relacionados'}
            </DialogTitle>
          </DialogHeader>
          {foreignModalColumn && intermediateTableId && (
            <LogicalTableDataView tableId={intermediateTableId} colName={columnName} constFilter={{
              column: "original_record_id",
              condition: "equals",
              value: columnName?.column_id ?? "",
            }}
            hiddenColumns={["original_record_id"]}/>
            )}
          <div className="flex justify-end mt-4">
            <Button onClick={() => setForeignModalOpen(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

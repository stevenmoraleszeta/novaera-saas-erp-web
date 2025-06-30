import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getLogicalTableStructure,
  createLogicalTableRecord,
  updateLogicalTableRecord, // <--- debe existir en tu service
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

export default function DynamicRecordFormDialog({
  open = false,
  onOpenChange,
  tableId,
  mode = "create", // "create" | "edit"
  record = null, // objeto con datos a editar en modo edit
  onSubmitSuccess,
  onDelete,
}) {
  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Carga columnas y valores iniciales según modo y record
  useEffect(() => {
    if (!tableId || !open) return;

    (async () => {
      try {
        const cols = await getLogicalTableStructure(tableId);
        setColumns(cols);

        const initialValues = {};
          cols.forEach((col) => {
            
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

  return (
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
              {columns.map((col) => (
                <div key={col.column_id} className="space-y-2">
                  <Label htmlFor={`field-${col.name}`}>
                    {col.name}
                    {col.is_required && (
                      <Badge className="ml-auto text-xs text-destructive bg-transparent">
                        *Requerido
                      </Badge>
                    )}
                  </Label>
                  <FieldRenderer
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
                  {errors[col.name] && (
                    <div className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors[col.name]}
                    </div>
                  )}
                </div>
              ))}

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
  );
}

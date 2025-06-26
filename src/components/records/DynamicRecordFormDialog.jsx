import React, { useState, useEffect, useCallback } from "react";
import {
  getLogicalTableStructure,
  createLogicalTableRecord,
} from "@/services/logicalTableService";
import FieldRenderer from "../common/FieldRenderer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DynamicRecordFormDialog({
  open = false,
  onOpenChange,
  tableId,
  onSubmitSuccess,
}) {
  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Load columns and initial values
  useEffect(() => {
    if (!tableId || !open) return;

    (async () => {
      try {
        const cols = await getLogicalTableStructure(tableId);
        setColumns(cols);
        const initialValues = {};
        cols.forEach((col) => {
          initialValues[col.name] = col.data_type === "boolean" ? false : "";
        });
        setValues(initialValues);
        setErrors({});
        setSubmitError(null);
      } catch {
        setColumns([]);
        setValues({});
      }
    })();
  }, [tableId, open]);

  // Simple validation
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

    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();
        setSubmitError(null);
        if (!validate()) return;

        setLoading(true);
        try {
          const createdRecord = await createLogicalTableRecord(tableId, values);
          if (onSubmitSuccess) onSubmitSuccess(createdRecord);

          // Reset form after successful submission
          const initialValues = {};
          columns.forEach((col) => {
            initialValues[col.name] = col.data_type === "boolean" ? false : "";
          });
          setValues(initialValues);
          setErrors({});
          onOpenChange?.(false);
        } catch (err) {
          setSubmitError(
            err?.response?.data?.message || "Error al guardar el registro"
          );
        } finally {
          setLoading(false);
        }
      },
      [tableId, values, validate, onSubmitSuccess, columns, onOpenChange]
    );

  const handleCancel = () => {
    if (!loading) {
      onOpenChange?.(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Nuevo Registro
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Completa los campos para crear un nuevo registro
              </DialogDescription>
            </div>
          </div>
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
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {columns.map((col) => (
              <div key={col.id} className="space-y-2">
                <label
                  htmlFor={`field-${col.name}`}
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  {col.name}
                  {col.is_required && (
                    <Badge className="ml-auto text-xs text-destructive bg-transparent">
                      *Requerido
                    </Badge>
                  )}
                </label>
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

            <DialogFooter className="flex gap-2 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Registro
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

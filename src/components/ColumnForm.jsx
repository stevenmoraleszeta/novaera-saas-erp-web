"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog-header";
import { DialogActions } from "@/components/ui/dialog-actions";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  FileText,
  Link,
  Settings,
  Shield,
  Code2,
  X,
  Save,
  Trash2,
} from "lucide-react";

import useUserStore from "@/stores/userStore";
import { useForeignKeyOptions } from "@/hooks/useForeignKeyOptions";
import ColumnTypeSelector from "./ColumnTypeSelector";
import ForeignKeySelector from "./ForeignKeySelector";

export default function ColumnForm({
  open = false,
  onOpenChange,
  mode = "create",
  initialData = {},
  onSubmit,
  onCancel,
  onDelete,
  loading = false,
  error = null,
  tableId,
  lastPosition = 0,
}) {
  const { user } = useUserStore();
  const { tables, columnsByTable } = useForeignKeyOptions();
  const topRef = useRef(null);

  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    data_type: "string",
    is_required: false,
    is_foreign_key: false,
    relation_type: "",
    foreign_table_id: 0,
    foreign_column_name: "",
    foreign_column_id: "",
    validations: "",
    table_id: tableId,
    created_by: user?.id || null,
    column_position: lastPosition,
  });

  useEffect(() => {
    setFormError(null);

    if (mode === "edit" && initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    } else if (mode === "create") {
      setFormData({
        name: "",
        data_type: "string",
        is_required: false,
        is_foreign_key: false,
        relation_type: "",
        foreign_table_id: 0,
        foreign_column_name: "",
        foreign_column_id: "",
        validations: "",
        table_id: tableId,
        created_by: user?.id || null,
        column_position: lastPosition,
      });
    }
  }, [initialData, open, mode, tableId, user?.id, lastPosition]);

  useEffect(() => {
    if ((formError || error) && topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [formError, error]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("El nombre de la columna es obligatorio.");
      return;
    }
    try {
      setFormError(null);
      await onSubmit(formData);
    } catch (err) {
      const msg = err?.response?.data?.error || "Error al guardar la columna";
      setFormError(msg);
    }
  };

  const handleDelete = () => {
    if (onDelete && initialData?.id) {
      onDelete(initialData.id);
    }
  };

  const handleCancel = () => {
    setFormError(null);
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <div ref={topRef} />
        <DialogHeader
          icon={Code2}
          title={mode === "edit" ? "Editar Columna" : "Crear Columna"}
          description={
            mode === "edit"
              ? "Modifica las propiedades de esta columna"
              : "Agrega una nueva columna a esta tabla"
          }
          iconBgColor="from-gray-800 to-black"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              Nombre de la Columna
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej: nombre_cliente, precio, creado_el..."
              required
              disabled={loading}
            />
          </div>

          {/* Tipo de Dato */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Package className="w-4 h-4" />
              Tipo de Dato
            </Label>
            <ColumnTypeSelector
              value={formData.data_type}
              onChange={(value) => handleChange("data_type", value)}
            />
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Shield className="w-4 h-4" />
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => handleChange("is_required", e.target.checked)}
              />
              ¿Requerida?
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Link className="w-4 h-4" />
              <input
                type="checkbox"
                checked={formData.is_foreign_key}
                onChange={(e) => handleChange("is_foreign_key", e.target.checked)}
              />
              ¿Llave Foránea?
            </label>
          </div>

          {/* Tipo de Relación */}
          <div className="space-y-2">
            <Label htmlFor="relation_type" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Settings className="w-4 h-4" />
              Tipo de Relación
            </Label>
            <Input
              id="relation_type"
              type="text"
              value={formData.relation_type}
              onChange={(e) => handleChange("relation_type", e.target.value)}
              placeholder="uno-a-uno, uno-a-muchos, etc."
              disabled={loading}
            />
          </div>

          {/* Selector de llave foránea */}
          {formData.is_foreign_key && (
            <ForeignKeySelector
              tables={tables}
              columnsByTable={columnsByTable}
              selectedTableId={formData.foreign_table_id}
              selectedColumnId={formData.foreign_column_name}
              onChangeTable={(value) => handleChange("foreign_table_id", Number(value))}
              onChangeColumn={(value) => handleChange("foreign_column_name", value)}
              required={formData.relation_type !== ""}
            />
          )}

          {/* Validaciones */}
          <div className="space-y-2">
            <Label htmlFor="validations" className="text-sm font-medium text-gray-700">
              Reglas de Validación
            </Label>
            <Textarea
              id="validations"
              value={formData.validations}
              onChange={(e) => handleChange("validations", e.target.value)}
              placeholder="Ej: mínimo 3 caracteres, no nulo, expresión regex..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Error */}
          {formError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          <Separator className="my-6" />

          {/* Botones */}
          <DialogActions
            cancelAction={{
              onClick: handleCancel,
              label: "Cancelar",
              icon: X,
            }}
            primaryAction={{
              onClick: handleSubmit,
              label: mode === "edit" ? "Actualizar Columna" : "Crear Columna",
              icon: Save,
              variant: "default",
              className:
                "bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200",
            }}
            secondaryAction={
              mode === "edit" && onDelete
                ? {
                    onClick: handleDelete,
                    label: "Eliminar",
                    icon: Trash2,
                    variant: "destructive",
                  }
                : undefined
            }
            loading={loading}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

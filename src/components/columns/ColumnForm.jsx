"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X, Save, Trash2 } from "lucide-react";

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
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <div ref={topRef} />
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Columna" : "Crear Columna"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Columna</Label>
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
              <Label>Tipo de Dato</Label>
              <ColumnTypeSelector
                value={formData.data_type}
                onChange={(value) => handleChange("data_type", value)}
              />
            </div>

            {/* Checkboxes */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.is_required}
                  onChange={(e) =>
                    handleChange("is_required", e.target.checked)
                  }
                />
                ¿Requerida?
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.is_foreign_key}
                  onChange={(e) =>
                    handleChange("is_foreign_key", e.target.checked)
                  }
                />
                ¿Llave Foránea?
              </label>
            </div>

            {/* Tipo de Relación */}
            <div className="space-y-2">
              <Label htmlFor="relation_type">Tipo de Relación</Label>
              <select
                id="relation_type"
                value={formData.relation_type}
                onChange={(e) => handleChange("relation_type", e.target.value)}
                disabled={!formData.is_foreign_key || loading}
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">Selecciona el tipo de relación</option>
                <option value="one_to_one">Uno a Uno</option>
                <option value="one_to_many">Uno a Muchos</option>
                <option value="many_to_one">Muchos a Uno</option>
                <option value="many_to_many">Muchos a Muchos</option>
              </select>
            </div>

            {/* Foreign Key Selector */}
            {formData.is_foreign_key && (
              <ForeignKeySelector
                tables={tables}
                columnsByTable={columnsByTable}
                selectedTableId={formData.foreign_table_id}
                selectedColumnId={formData.foreign_column_id}
                onTableChange={(tableId) =>
                  handleChange("foreign_table_id", tableId)
                }
                onColumnChange={(columnId) =>
                  handleChange("foreign_column_id", columnId)
                }
              />
            )}

            {/* Validaciones */}
            <div className="space-y-2">
              <Label htmlFor="validations">Validaciones</Label>
              <Textarea
                id="validations"
                value={formData.validations}
                onChange={(e) => handleChange("validations", e.target.value)}
                placeholder="Ej: min:0, max:100, email, unique..."
                rows={3}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Reglas de validación separadas por comas
              </p>
            </div>

            {/* Error Display */}
            {(formError || error) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">
                    {formError || error}
                  </span>
                </div>
              </div>
            )}
          </form>
        </div>

        <DialogFooter>
          {mode === "edit" && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Eliminar
            </Button>
          )}
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>{mode === "edit" ? "Actualizar" : "Crear"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

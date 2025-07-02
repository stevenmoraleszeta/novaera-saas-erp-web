"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getOrCreateJoinTable } from "@/services/tablesService";

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

  const handleTypeChange = (value) => {
    handleChange("data_type", value);
    if (value === "foreign") {
      handleChange("is_foreign_key", true);
    } else {
      handleChange("is_foreign_key", false);
      handleChange("foreign_table_id", 0);
      handleChange("relation_type", "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("El nombre de la columna es obligatorio.");
      return;
    }
    try {
      setFormError(null);

      if (
        formData.data_type === "foreign" &&
        formData.foreign_table_id &&
        formData.table_id
      ) {
        await getOrCreateJoinTable(formData.table_id, formData.foreign_table_id);
      }

      // Prepara el objeto para crear la columna
      const columnData = {
        ...formData,
        is_foreign_key: formData.data_type === "foreign",
        foreign_table_id: formData.data_type === "foreign" || formData.data_type === "select" ? formData.foreign_table_id : null,
        foreign_column_name: formData.data_type === "foreign" || formData.data_type === "select" ? formData.foreign_column_name : null,
      };

      console.log("columnData enviado:", columnData);

      await onSubmit(columnData);
    } catch (err) {
      const msg = err?.response?.data?.error || "Error al guardar la columna";
      setFormError(msg);
    }
  };

  const handleDelete = () => {
    if (onDelete && initialData?.column_id) {
      console.log("Calling onDelete with ID:", initialData.column_id);
      onDelete(initialData.column_id);
    } else {
      console.log("onDelete not available or no initialData.column_id");
    }
  };

  const handleCancel = () => {
    setFormError(null);
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col max-h-[90vh] overflow-y-auto">
        <div ref={topRef} />
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Columna" : "Crear Columna"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 ">
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
                onChange={handleTypeChange}
              />
            </div>

            {/* Tabla Foránea para tipo foreign */}
            {formData.data_type === "foreign" && (
              <div className="space-y-2">
                <Label>Tabla Foránea</Label>
                <Select
                  value={formData.foreign_table_id?.toString() || ""}
                  onValueChange={(value) => handleChange("foreign_table_id", Number(value))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una tabla" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables
                      .filter((table) => !table.name.startsWith('mid_'))
                      .map((table) => (
                        <SelectItem key={table.id} value={table.id.toString()}>
                          {table.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Columna Foránea para tipo foreign */}
            {formData.data_type === "foreign" && formData.foreign_table_id && (
              <div className="space-y-2">
                <Label>Columna Foránea</Label>
                <Select
                  value={formData.foreign_column_name || ""}
                  onValueChange={(value) => handleChange("foreign_column_name", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona columna foránea" />
                  </SelectTrigger>
                  <SelectContent>
                    {(columnsByTable[formData.foreign_table_id] || []).map((col) => (
                      <SelectItem key={col.name} value={col.name}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* --- NUEVO: Lógica separada para tipo select --- */}
            {formData.data_type === "select" && (
              <div className="space-y-2">
                <Label>Tabla de origen (para select)</Label>
                <Select
                  value={formData.foreign_table_id?.toString() || ""}
                  onValueChange={(value) => handleChange("foreign_table_id", Number(value))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una tabla" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables
                      .filter((table) => !table.name.startsWith('mid_'))
                      .map((table) => (
                        <SelectItem key={table.id} value={table.id.toString()}>
                          {table.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {formData.data_type === "select" && formData.foreign_table_id && (
              <div className="space-y-2">
                <Label>Campo a mostrar (para select)</Label>
                <Select
                  value={formData.foreign_column_name || ""}
                  onValueChange={(value) => handleChange("foreign_column_name", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(columnsByTable[formData.foreign_table_id] || []).map((col) => (
                      <SelectItem key={col.name} value={col.name}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Checkboxes */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Checkbox
                  checked={formData.is_required || formData.data_type === "foreign"}
                  onCheckedChange={(checked) =>
                    handleChange("is_required", checked)
                  }
                  className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                  disabled={formData.data_type === "foreign"}
                />
                ¿Requerida?
              </label>
            </div>
            
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
              <>{mode === "edit" ? "Guardar" : "Crear"}</>
            )}
          </Button>
          {mode === "edit" && onDelete && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={loading}
            >
              Eliminar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

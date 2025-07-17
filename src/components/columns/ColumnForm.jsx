"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import SelectionTypeSelector from "./SelectionTypeSelector";
import CustomOptionsManager from "./CustomOptionsManager";
import { getOrCreateJoinTable } from "@/services/tablesService";

import ReusableCombobox from "@/components/ui/reusableCombobox";

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
    foreign_table_id: null,
    foreign_column_name: "",
    foreign_column_id: null,
    validations: "",
    table_id: tableId,
    created_by: user?.id || null,
    column_position: lastPosition,
    related_table_name: "",
    related_table_description: "",
  });
  const DATA_TYPES = [
    { label: "Texto", value: "string" },
    { label: "Texto largo", value: "text" },
    { label: "Número entero", value: "integer" },
    { label: "Número decimal", value: "decimal" },
    { label: "Checkbox", value: "boolean" },
    { label: "Fecha", value: "date" },
    { label: "Fecha y hora", value: "datetime" },
    { label: "Relación Foránea", value: "foreign" },
    { label: "Selección", value: "select" },
    { label: "Archivo", value: "file" },
    { label: "Múltiples archivos", value: "file_array" },
    { label: "Usuario", value: "user" },
    { label: "Usuarios Asignados", value: "assigned_users" },
    { label: "JSON", value: "json" },
    { label: "UUID", value: "uuid" },
  ];

  // Estados para opciones personalizadas
  const [selectionType, setSelectionType] = useState("table");
  const [customOptions, setCustomOptions] = useState([]);

  // filter for tables/no include foreing tables (" - ")
  const filteredTables = useMemo(() => {
    if (!tables) return [];
    return tables.filter(
      (table) =>
        !table.name.startsWith("mid_") && !table.name.includes(" - ")
    );
  }, [tables]);

  const tableOptions = useMemo(() => {
    if (!tables) return [];
    return tables
      .filter((table) => !table.name.startsWith("mid_") && !table.name.includes(" - "))
      .map((table) => ({
        label: table.name,
        value: table.id,
      }));
  }, [tables]);

  const foreignColumnOptions = useMemo(() => {
    if (!formData.foreign_table_id || !columnsByTable[formData.foreign_table_id]) {
      return [];
    }
    return columnsByTable[formData.foreign_table_id].map((col) => ({
      label: col.name,
      value: col.name,
    }));
  }, [formData.foreign_table_id, columnsByTable]);

  useEffect(() => {
    setFormError(null);

    if (mode === "edit" && initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
      
      // Si tiene opciones personalizadas, cargarlas
      if (initialData.custom_options && initialData.custom_options.length > 0) {
        // Convertir formato si viene del backend con { value, label }
        const options = Array.isArray(initialData.custom_options[0]) ? 
          initialData.custom_options : 
          initialData.custom_options.map(opt => typeof opt === 'string' ? opt : opt.label || opt.value);
        setCustomOptions(options);
        setSelectionType("custom");
      } else {
        setSelectionType("table");
        setCustomOptions([]);
      }
    } else if (mode === "create") {
      setFormData({
        name: "",
        data_type: "string",
        is_required: false,
        is_foreign_key: false,
        relation_type: "",
        foreign_table_id: null,
        foreign_column_name: "",
        foreign_column_id: null,
        validations: "",
        table_id: tableId,
        created_by: user?.id || null,
        column_position: lastPosition,
      });
      setSelectionType("table");
      setCustomOptions([]);
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
      handleChange("foreign_table_id", null);
      handleChange("foreign_column_name", "");
      handleChange("foreign_column_id", null);
      handleChange("relation_type", "");
    }
    // Para tipos de archivo, limpiar configuraciones de foreign key
    if (value === "file" || value === "file_array") {
      handleChange("is_foreign_key", false);
      handleChange("foreign_table_id", null);
      handleChange("foreign_column_name", "");
      handleChange("foreign_column_id", null);
      handleChange("relation_type", "");
    }
    // Si no es tipo selección, resetear opciones personalizadas
    if (value !== "select") {
      setCustomOptions([]);
      setSelectionType("table");
    }
    // Si es tipo tabla, limpiar nombre y descripción de tabla relacionada
    if (value !== "tabla") {
      handleChange("related_table_name", "");
      handleChange("related_table_description", "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("El nombre de la columna es obligatorio.");
      return;
    }
    // Validar nombre de tabla relacionada si es tipo tabla
    if (formData.data_type === "tabla") {
      if (!formData.related_table_name.trim()) {
        setFormError("El nombre de la nueva tabla es obligatorio para columnas de tipo tabla.");
        return;
      }
    }
    // Validar opciones personalizadas para tipo selección
    if (formData.data_type === "select" && selectionType === "custom") {
      if (customOptions.length === 0) {
        setFormError("Debe agregar al menos una opción personalizada para columnas de tipo selección.");
        return;
      }
      // Validar que todas las opciones tengan contenido
      const invalidOptions = customOptions.some(option => !option.trim());
      if (invalidOptions) {
        setFormError("Todas las opciones deben tener contenido.");
        return;
      }
    }

    try {
      setFormError(null);

      if (
        formData.data_type === "foreign" &&
        formData.foreign_table_id &&
        formData.table_id
      ) {
        // console.log("data = ", formData)
        await getOrCreateJoinTable(formData.table_id, formData.foreign_table_id, formData.foreign_column_name);
      }

      // Prepara el objeto para crear la columna
      const columnData = {
        ...formData,
        is_foreign_key: formData.data_type === "foreign",
        foreign_table_id: (formData.data_type === "foreign" || (formData.data_type === "select" && selectionType === "table")) ? formData.foreign_table_id : null,
        foreign_column_name: (formData.data_type === "foreign" || (formData.data_type === "select" && selectionType === "table")) ? formData.foreign_column_name : null,
        // Solo enviar nombre y descripción de tabla relacionada si es tipo tabla
        related_table_name: formData.data_type === "tabla" ? formData.related_table_name : undefined,
        related_table_description: formData.data_type === "tabla" ? formData.related_table_description : undefined,
      };

      // Agregar opciones personalizadas si es tipo selección con opciones custom
      if (formData.data_type === "select" && selectionType === "custom") {
        columnData.custom_options = customOptions.map(opt =>
          typeof opt === "string"
            ? { value: opt, label: opt }
            : opt
        );
        console.log("Sending custom options:", columnData.custom_options);
      }

      // Para tipos de archivo, asegurar que no tengan configuraciones de foreign key
      if (formData.data_type === "file" || formData.data_type === "file_array") {
        columnData.is_foreign_key = false;
        columnData.foreign_table_id = null;
        columnData.foreign_column_name = null;
        columnData.foreign_column_id = null;
        columnData.relation_type = "";
      }

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

  const handleTableChange = (value) => {
    handleChange("foreign_table_id", value ? Number(value) : null);
    handleChange("foreign_column_name", "");
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
              <ReusableCombobox
                label="Tipo de Dato"
                placeholder="Seleccione un tipo de dato..."
                options={DATA_TYPES} // <- Le pasas los datos que moviste
                value={formData.data_type}
                onChange={handleTypeChange}
                options={["string", "number", "boolean", "date", "select", "file", "file_array", "foreign", "tabla"]}
              />
            </div>

            {/* Si es tipo tabla, pedir nombre y descripción de la nueva tabla */}
            {formData.data_type === "tabla" && (
              <div className="space-y-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Label htmlFor="related_table_name">Nombre de la nueva tabla</Label>
                <Input
                  id="related_table_name"
                  type="text"
                  value={formData.related_table_name}
                  onChange={(e) => handleChange("related_table_name", e.target.value)}
                  placeholder="Ej: detalles_factura, items_orden..."
                  required
                  disabled={loading}
                />
                <Label htmlFor="related_table_description">Descripción de la nueva tabla (opcional)</Label>
                <Textarea
                  id="related_table_description"
                  value={formData.related_table_description}
                  onChange={(e) => handleChange("related_table_description", e.target.value)}
                  placeholder="Describe el propósito de la nueva tabla"
                  rows={2}
                  disabled={loading}
                />
              </div>
            )}

            {/* Tabla Foránea para tipo foreign */}
            {formData.data_type === "foreign" && (
              <div className="space-y-2">
                <ReusableCombobox
                  label="Tabla Foránea"
                  placeholder="Selecciona una tabla"
                  options={tableOptions}
                  value={formData.foreign_table_id}
                  onChange={(value) => handleChange("foreign_table_id", value ? Number(value) : null)}
                  disabled={loading}
                />
              </div>
            )}

            {/* Columna Foránea para tipo foreign */}
            {formData.data_type === "foreign" && formData.foreign_table_id && (
              <div className="space-y-2">
                <ReusableCombobox
                  label="Columna Foránea"
                  placeholder="Selecciona columna foránea"
                  options={foreignColumnOptions}
                  value={formData.foreign_column_name}
                  onChange={(value) => handleChange("foreign_column_name", value)}
                  disabled={loading}
                />
              </div>
            )}

            {/* --- NUEVO: Lógica para tipo select con opciones personalizadas --- */}
            {formData.data_type === "select" && (
              <div className="space-y-4">
                {/* Selector de tipo de selección */}
                <SelectionTypeSelector
                  value={selectionType}
                  onChange={setSelectionType}
                  disabled={loading}
                />

                {/* Si es tipo tabla, mostrar selectores de tabla */}
                {selectionType === "table" && (
                  <>
                    <div className="space-y-2">
                      <ReusableCombobox
                        label="Tabla de origen"
                        placeholder="Selecciona una tabla"
                        options={tableOptions}
                        value={formData.foreign_table_id}
                        onChange={(value) => handleChange("foreign_table_id", value ? Number(value) : null)}
                        disabled={loading}
                      />
                    </div>

                    {formData.foreign_table_id && (
                      <div className="space-y-2">
                        <ReusableCombobox
                          label="Campo a mostrar"
                          placeholder="Selecciona campo"
                          options={foreignColumnOptions}
                          value={formData.foreign_column_name}
                          onChange={(value) => handleChange("foreign_column_name", value)}
                          disabled={loading}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Si es tipo custom, mostrar gestor de opciones */}
                {selectionType === "custom" && (
                  <CustomOptionsManager
                    options={customOptions}
                    onChange={setCustomOptions}
                    disabled={loading}
                  />
                )}
              </div>
            )}

            {/* Información para tipos de archivo */}
            {(formData.data_type === "file" || formData.data_type === "file_array") && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">
                    {formData.data_type === "file" ? "Archivo individual" : "Múltiples archivos"}
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Tipos permitidos: Imágenes (JPEG, PNG, GIF, WebP), PDF, Word, Excel, TXT</p>
                    <p>• Tamaño máximo por archivo: 10MB</p>
                    {formData.data_type === "file_array" && (
                      <p>• Los usuarios podrán subir múltiples archivos para este campo</p>
                    )}
                  </div>
                </div>
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

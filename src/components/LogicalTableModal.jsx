import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog-header";
import { DialogActions } from "@/components/ui/dialog-actions";
import { Separator } from "@/components/ui/separator";
import { Database, FileText, Hash, Save, X } from "lucide-react";

export default function LogicalTableModal({
  open = false,
  onOpenChange,
  mode = "create",
  initialData = {},
  onSubmit,
  onCancel,
  validate,
  loading = false,
  error = null,
}) {
  const isEditMode = mode === "edit";

  // Form state
  const [formData, setFormData] = useState({
    id: undefined,
    name: "",
    alias: "",
    description: "",
  });

  // Validation state
  const [formErrors, setFormErrors] = useState({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && initialData) {
      setFormData({
        id: initialData?.id,
        name: initialData?.name || "",
        alias: initialData?.alias || "",
        description: initialData?.description || "",
      });
    } else if (!open) {
      setFormData({
        id: undefined,
        name: "",
        alias: "",
        description: "",
      });
      setFormErrors({});
    }
  }, [open, initialData]);

  // Handle form input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio";
    } else if (formData.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    // Alias validation (optional but if provided, validate format)
    if (formData.alias.trim() && formData.alias.trim().length < 2) {
      errors.alias = "El alias debe tener al menos 2 caracteres";
    }

    // Description validation (optional)
    if (formData.description.trim() && formData.description.trim().length < 5) {
      errors.description = "La descripción debe tener al menos 5 caracteres";
    }

    // Custom validation if provided
    if (validate) {
      const customErrors = validate(formData);
      Object.assign(errors, customErrors);
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      name: formData.name.trim(),
      alias: formData.alias.trim() || null,
      description: formData.description.trim() || null,
    };
    if (!submitData.id) delete submitData.id;

    onSubmit(submitData);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader
          icon={Database}
          title={
            isEditMode ? "Editar Tabla Lógica" : "Crear Nueva Tabla Lógica"
          }
          description={
            isEditMode
              ? "Modifica la información de la tabla lógica"
              : "Define una nueva tabla lógica para este módulo"
          }
          iconBgColor="from-gray-800 to-black"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Información Básica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  Nombre de la tabla *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ej: usuarios, productos, ventas"
                  className={formErrors.name ? "border-red-500" : ""}
                  disabled={loading}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-600">{formErrors.name}</p>
                )}
                <p className="text-xs text-gray-500">
                  Nombre único para identificar la tabla
                </p>
              </div>

              {/* Alias Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="alias"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Hash className="w-4 h-4" />
                  Alias (opcional)
                </Label>
                <Input
                  id="alias"
                  type="text"
                  value={formData.alias}
                  onChange={(e) => handleChange("alias", e.target.value)}
                  placeholder="Ej: usr, prod, vta"
                  className={formErrors.alias ? "border-red-500" : ""}
                  disabled={loading}
                />
                {formErrors.alias && (
                  <p className="text-xs text-red-600">{formErrors.alias}</p>
                )}
                <p className="text-xs text-gray-500">
                  Abreviatura opcional para la tabla
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description Field */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Descripción
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Descripción de la tabla
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe el propósito y contenido de esta tabla..."
                rows={4}
                className={formErrors.description ? "border-red-500" : ""}
                disabled={loading}
              />
              {formErrors.description && (
                <p className="text-xs text-red-600">{formErrors.description}</p>
              )}
              <p className="text-xs text-gray-500">
                Explica qué datos contiene y para qué se utiliza esta tabla
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <DialogActions
            cancelAction={{
              onClick: handleCancel,
              label: "Cancelar",
              icon: X,
            }}
            primaryAction={{
              onClick: handleSubmit,
              label: isEditMode ? "Actualizar Tabla" : "Crear Tabla",
              icon: Save,
              variant: "default",
              className:
                "bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200",
            }}
            loading={loading}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

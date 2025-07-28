"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XIcon, AlertCircle } from "lucide-react";

export default function RoleModal({
  open = false,
  onOpenChange,
  role = null,
  onSave,
  onDelete,
  loading = false,
  showDeleteButton = false,
}) {
  const [formData, setFormData] = useState({
    nombre: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (open && role) {
      // Editing existing role
      setFormData({
        nombre: role.name || "",
      });
    } else if (open) {
      // Creating new role
      setFormData({
        nombre: "",
      });
    }
    setErrors({});
    setSubmitError(null);
    setIsDirty(false);
  }, [open, role]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
    setIsDirty(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre del rol es requerido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitError(null);

    try {
      onSave && await onSave(formData);
      setIsDirty(false);
    } catch (error) {
      setSubmitError(error?.response?.data?.message || "Error al guardar el rol");
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onOpenChange?.(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-10 bg-black/30 flex items-start justify-center px-4 py-28">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[600px] relative z-10 flex flex-col overflow-hidden h-auto min-h-[400px]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold">
            {role ? "Editar Rol" : "Nuevo Rol"}
          </h2>
          <button
            onClick={handleCancel}
            className="bg-black text-white ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            aria-label="Cerrar modal"
          >
            <XIcon />
          </button>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto px-4 py-2 flex-1">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre del Rol
                <Badge className="ml-1 text-xs text-destructive bg-transparent">
                  *Requerido
                </Badge>
              </Label>
              <Input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Ej: Administrador, Usuario, Editor..."
                className={`h-11 ${errors.nombre ? "border-red-500" : ""}`}
                disabled={loading}
                autoFocus
              />
              {errors.nombre && (
                <div className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.nombre}
                </div>
              )}
            </div>
            
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>

        {/* Footer con botones */}
        <div className="border-t p-4 flex justify-between">
          {/* Izquierda: Guardar y Eliminar */}
          <div className="flex gap-2">
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
            
            {showDeleteButton && role && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onDelete && onDelete(role)}
                disabled={loading}
              >
                Eliminar
              </Button>
            )}
          </div>

          {/* Derecha: vacío por ahora, pero mantiene la estructura */}
          <div className="flex gap-2">
            {/* Aquí se pueden agregar más botones en el futuro si es necesario */}
          </div>
        </div>
      </div>
    </div>
  );
}

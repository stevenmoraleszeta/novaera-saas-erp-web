"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog-header";
import { DialogActions } from "@/components/ui/dialog-actions";
import { Separator } from "@/components/ui/separator";
import PermissionSelector from "../common/PermissionSelector";
import { Shield, Save, X, Loader2 } from "lucide-react";

export default function RoleForm({
  open = false,
  onOpenChange,
  initialData = {},
  permissions = [],
  onSubmit,
  onCancel,
  loading = false,
}) {
  const safeData = initialData || {};
  const [name, setName] = useState(safeData.name || "");
  const [description, setDescription] = useState(safeData.description || "");
  const [selectedPermissions, setSelectedPermissions] = useState(
    safeData.permissions || []
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      const safeData = initialData || {};
      setName(safeData.name || "");
      setDescription(safeData.description || "");
      // Solo setea permisos si es creación, no si es edición
      if (!safeData.id) {
        setSelectedPermissions(safeData.permissions || []);
      }
      setError(null);
    }
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || name.length < 3) {
      setError("El nombre es obligatorio y debe tener al menos 3 caracteres.");
      return;
    }
    if (selectedPermissions.length === 0) {
      setError("Debes asignar al menos un permiso.");
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      permissions: selectedPermissions,
    });
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange?.(false);
  };

  if (!permissions || permissions.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Cargando permisos...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader
          icon={Shield}
          title={initialData?.id ? "Editar Rol" : "Crear Nuevo Rol"}
          description={
            initialData?.id
              ? "Modifica la información del rol"
              : "Define un nuevo rol para el sistema"
          }
          iconBgColor="from-blue-500 to-purple-600"
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
            <h3 className="text-lg font-medium text-gray-900">
              Información Básica
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Nombre del Rol *
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Administrador, Usuario, Editor..."
                className="h-11"
                autoFocus
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Descripción
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente el rol y sus responsabilidades..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <Separator />

          {/* Permissions Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Permisos</h3>
            <PermissionSelector
              value={selectedPermissions}
              onChange={setSelectedPermissions}
              permissions={permissions}
            />
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
              label: "Guardar",
              icon: Save,
              variant: "default",
              className:
                "bg-black hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200",
            }}
            loading={loading}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

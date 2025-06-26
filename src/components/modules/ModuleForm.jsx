"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useUserStore from "@/stores/userStore";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog-header";
import { DialogActions } from "@/components/ui/dialog-actions";
import { Separator } from "@/components/ui/separator";

import {
  X,
  Save,
  Trash2,
  Package,
  FileText,
  Link,
  Users,
  ShoppingCart,
  Settings,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FolderKanban,
} from "lucide-react";

export default function ModuleForm({
  open = false,
  onOpenChange,
  mode = "create",
  initialData = null,
  onSubmit,
  onCancel,
  onDelete,
  loading = false,
  error = null,
}) {
  const { user } = useUserStore();

  const iconOptions = [
    { name: "Users", Icon: Users },
    { name: "ShoppingCart", Icon: ShoppingCart },
    { name: "Settings", Icon: Settings },
    { name: "BarChart3", Icon: BarChart3 },
    { name: "CalendarDays", Icon: CalendarDays },
    { name: "ClipboardList", Icon: ClipboardList },
    { name: "FolderKanban", Icon: FolderKanban },
    { name: "Package", Icon: Package },
  ];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        icon: initialData.icon || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        icon: "",
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ ...formData, createdBy: user.id });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDelete = () => {
    if (onDelete && initialData) {
      onDelete(initialData);
    }
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
          icon={Package}
          title={mode === "edit" ? "Editar Módulo" : "Crear Nuevo Módulo"}
          description={
            mode === "edit"
              ? "Actualiza la información del módulo existente"
              : "Define un nuevo módulo para tu sistema ERP"
          }
          iconBgColor="from-gray-800 to-black"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Module Name Field */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Nombre del Módulo
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej: Gestión de Usuarios, Inventario, Facturación..."
              required
              disabled={loading}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
            />
            <p className="text-xs text-gray-500">
              El nombre que aparecerá en el menú principal
            </p>
          </div>

          <Separator className="my-6" />

          {/* Description Field */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Descripción
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe las funcionalidades y propósito de este módulo..."
              rows={4}
              disabled={loading}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors resize-none"
            />
            <p className="text-xs text-gray-500">
              Una descripción clara ayuda a otros usuarios a entender el
              propósito del módulo
            </p>
          </div>

          <Separator className="my-6" />

          {/* Icon Selection Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Link className="w-4 h-4" />
              Ícono del Módulo
            </Label>
            <div className="grid grid-cols-4 gap-4">
              {iconOptions.map(({ name, Icon }) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => handleChange("icon", name)}
                  className={`p-3 border rounded-lg transition-colors ${
                    formData.icon === name
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto text-gray-800" />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Selecciona un ícono que represente visualmente el módulo
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <DialogActions
            cancelAction={{
              onClick: handleCancel,
              label: "Cancelar",
              icon: X,
            }}
            primaryAction={{
              onClick: handleSubmit,
              label: mode === "edit" ? "Actualizar Módulo" : "Crear Módulo",
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
                    className:
                      "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200",
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

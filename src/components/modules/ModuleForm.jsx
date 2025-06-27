"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useUserStore from "@/stores/userStore";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  X,
  Save,
  Trash2,
  Users,
  ShoppingCart,
  Settings,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FolderKanban,
  Package,
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
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Módulo" : "Crear Nuevo Módulo"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Module Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Módulo</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ej: Gestión de Usuarios, Inventario, Facturación..."
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                El nombre que aparecerá en el menú principal
              </p>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe las funcionalidades y propósito de este módulo..."
                rows={4}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Una descripción clara ayuda a otros usuarios a entender el
                propósito del módulo
              </p>
            </div>

            {/* Icon Selection Field */}
            <div className="space-y-2">
              <Label>Ícono del Módulo</Label>
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
                  <X className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
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
              <>{mode === "edit" ? "Actualizar" : "Crear"}</>
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

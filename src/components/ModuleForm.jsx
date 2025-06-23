import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useUserStore from "@/stores/userStore";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Plus,
  Save,
  Edit3,
  Trash2,
  Package,
  FileText,
  Link,
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    iconUrl: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        iconUrl: initialData.iconUrl || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        iconUrl: "",
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
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
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {mode === "edit" ? "Editar Módulo" : "Crear Nuevo Módulo"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                {mode === "edit"
                  ? "Actualiza la información del módulo existente"
                  : "Define un nuevo módulo para tu sistema ERP"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

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

          {/* Icon URL Field */}
          <div className="space-y-2">
            <Label
              htmlFor="iconUrl"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Link className="w-4 h-4" />
              URL del Icono
            </Label>
            <Input
              id="iconUrl"
              type="url"
              value={formData.iconUrl}
              onChange={(e) => handleChange("iconUrl", e.target.value)}
              placeholder="https://ejemplo.com/icono.png"
              disabled={loading}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
            />
            <p className="text-xs text-gray-500">
              URL de una imagen que represente visualmente el módulo (opcional)
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
          <DialogFooter className="flex items-center justify-between pt-6">
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-11 px-6"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {mode === "edit" ? "Actualizando..." : "Creando..."}
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === "edit" ? "Actualizar Módulo" : "Crear Módulo"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>

            {mode === "edit" && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-11 px-6"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

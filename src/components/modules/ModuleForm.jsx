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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconPicker } from "@/components/modules/IconPicker";

import { X, Save, Trash2, Smile, ChevronDown, AlertTriangle } from "lucide-react";

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
    icon: "",
  });

  const [validationError, setValidationError] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if(open){
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          description: initialData.description || "",
          icon: initialData.iconUrl || initialData.icon_url || initialData.icon ||  "",   
        });
      } else {
        setFormData({
          name: "",
          description: "",
          icon: "",
        });
      }
      setValidationError(null);
    }
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);

    // Validation for previos icon selection...
    if (!formData.icon){
      setValidationError("Por favor, selecciona un ícono para el módulo");
      return;
    }

    if (onSubmit) {
      onSubmit({ ...formData, createdBy: user.id });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === 'icon' && value){
      setValidationError(null);
    }
  };
  
  const handleIconSelect = (fullUrl) => {
    handleChange("icon", fullUrl);
    setPickerOpen(false);
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

  const handleEmojiSelect = (emojiObject) => {
    const emojiName = emojiObject;
    const fileName = `${emojiName.replace(/_/g, '-')}`;
    const finalUrl = `${fileName}`;    
    handleChange("icon", finalUrl);
    setPickerOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Módulo" : "Crear Nuevo Módulo"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Module Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ej: Gestión de Usuarios, Inventario, Facturación..."
                required
                disabled={loading}
              />
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
            </div>

            {/* Emoji Selection Field */}
            <div className="space-y-2">
              <Label>Ícono</Label>
              <div className="flex items-center gap-4">
                {formData.icon && (
                  <img src={formData.icon} alt="ícono seleccionado" className="w-12 h-12 object-contain" />
                )}
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="flex items-center gap-2" disabled={loading}>
                      {formData.icon ? "Cambiar ícono" : "Seleccionar ícono"}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0"
                    side="bottom"
                    align="start"
                    collisionPadding={{ top: 100, bottom: 100 }}
                    sideOffset={-20}
                    >
                    <IconPicker  
                    onSelect={handleEmojiSelect} 
                    />
                  </PopoverContent>
                </Popover>
               {formData.icon && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleChange("icon", "")}
                    disabled={loading}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
              {/* Validation Message for without icon */}
                {validationError && (
                 <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{validationError}</span>
                 </div>
              )}
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

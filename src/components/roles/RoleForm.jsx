"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

import useUserStore from "@/stores/userStore";

export default function RoleForm({
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
    permissions: "",
    created_by: user?.id || null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        permissions: initialData.permissions || "",
        created_by: user?.id || null,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        permissions: "",
        created_by: user?.id || null,
      });
    }
  }, [initialData, open, user?.id]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Rol" : "Crear Nuevo Rol"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Rol</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ej: Administrador, Usuario, Editor..."
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
                placeholder="Describe las responsabilidades y alcance de este rol..."
                rows={4}
                disabled={loading}
              />
            </div>

            {/* Permissions Field */}
            <div className="space-y-2">
              <Label htmlFor="permissions">Permisos</Label>
              <Textarea
                id="permissions"
                value={formData.permissions}
                onChange={(e) => handleChange("permissions", e.target.value)}
                placeholder="Lista de permisos separados por comas..."
                rows={4}
                disabled={loading}
              />
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

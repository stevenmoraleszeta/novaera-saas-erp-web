"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";

export default function CustomOptionsManager({
  options = [],
  onChange,
  disabled = false,
  onDeleteOption,
  columnId,
}) {
  // Mapeo seguro de opciones para edición y visualización
  const mappedOptions = Array.isArray(options)
    ? options.map(opt => {
        if (typeof opt === "string") {
          return { value: opt, label: opt };
        }
        // Si viene de la base, preserva id y column_id
        if (opt.option_value && opt.option_label) {
          return {
            value: opt.option_value,
            label: opt.option_label,
            id: opt.id,
            column_id: opt.column_id
          };
        }
        if (opt.value && opt.label) {
          return {
            value: opt.value,
            label: opt.label,
            id: opt.id,
            column_id: opt.column_id
          };
        }
        return opt;
      })
    : [];
  const [newOption, setNewOption] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editedOptions, setEditedOptions] = useState({}); // { index: true }

  // Adaptar para manejar opciones como objetos { value, label }
  const handleAddOption = async () => {
    if (!newOption.trim()) return;
    // Siempre agregar localmente, sin POST inmediato
    const updatedOptions = [
      ...mappedOptions,
      { value: newOption.trim(), label: newOption.trim() }
    ];
    onChange(updatedOptions);
    setNewOption("");
  };

  const handleRemoveOption = (option, index) => {
    setPendingDelete({ option, index });
    setConfirmOpen(true);
  };

  const confirmDeleteOption = async () => {
    if (pendingDelete?.option?.id) {
      try {
        let axios;
        try {
          axios = require("@/lib/axios").default;
        } catch {
          axios = (await import("@/lib/axios")).default;
        }
        const res = await axios.delete(`/options/${pendingDelete.option.id}`);
        if (res.data?.success !== true) {
          console.error("Error al eliminar la opción en la base de datos", res.data);
        }
      } catch (err) {
        console.error("Error al eliminar la opción en la base de datos", err);
      }
      // Eliminar localmente después del DELETE
      const updatedOptions = mappedOptions.filter((_, i) => i !== pendingDelete.index);
      onChange(updatedOptions);
    } else {
      // Solo eliminar localmente si no tiene id (modo creación)
      const updatedOptions = mappedOptions.filter((_, i) => i !== pendingDelete.index);
      onChange(updatedOptions);
    }
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = mappedOptions.map((option, i) =>
      i === index
        ? { ...option, value, label: value }
        : option
    );
    onChange(updatedOptions);
    setEditedOptions(prev => ({ ...prev, [index]: true }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  };

  return (
    <>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro que deseas eliminar esta opción?</DialogTitle>
          </DialogHeader>
          <div className="py-4">Esta acción no se puede deshacer.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteOption}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Opciones Personalizadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de opciones existentes */}
          {mappedOptions.length > 0 && (
            <div className="space-y-3">
              {mappedOptions.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                >
                  <div className="cursor-move text-gray-400">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={option.label || option.value || ""}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder="Opción"
                      disabled={disabled}
                      className="h-8"
                    />
                  </div>
                  {/* Botón Guardar si la opción fue editada y tiene id */}
                  {editedOptions[index] && option.id && (
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      onClick={async () => {
                        let axios;
                        try {
                          axios = require("@/lib/axios").default;
                        } catch {
                          axios = (await import("@/lib/axios")).default;
                        }
                        try {
                          await axios.put(`/options/${option.id}`, {
                            option_value: option.value,
                            option_label: option.label
                          });
                          setEditedOptions(prev => ({ ...prev, [index]: false }));
                        } catch (err) {
                          console.error("Error al editar la opción:", err);
                        }
                      }}
                      disabled={disabled}
                      className="text-white hover:text-white"
                    >
                      Guardar
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveOption(option, index)}
                    disabled={disabled}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Agregar nueva opción */}
          <div className="border-t pt-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-sm text-gray-700">Nueva opción</Label>
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ej: Activo, Pendiente, Completado..."
                  disabled={disabled ? true : false}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddOption}
                disabled={disabled ? true : !newOption.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>

          {mappedOptions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No hay opciones personalizadas agregadas</p>
              <p className="text-sm">Agrega opciones usando el campo de arriba</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

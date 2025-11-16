"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DraggableOption from "./DraggableOption";

import ConfirmationDialog from "@/components/common/ConfirmationDialog";

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

  const sensors = useSensors(useSensor(PointerSensor));

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

  // Moví esto que estaba directamente en el return y lo puse como un handle
  const handleSaveOption = async (option, index) => {
    if (!option.id) return;
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

  // El drag and drop
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = mappedOptions.findIndex(opt => (opt.id || opt.value) === active.id);
      const newIndex = mappedOptions.findIndex(opt => (opt.id || opt.value) === over.id);
      const reorderedOptions = arrayMove(mappedOptions, oldIndex, newIndex);

      onChange(reorderedOptions);

      try {
        let axios;
        try {
          axios = require("@/lib/axios").default;
        } catch {
          axios = (await import("@/lib/axios")).default;
        }

        const updatePromises = reorderedOptions.map((option, index) => {
          if (option.id) {
            const payload = {
              option_value: option.value,
              option_label: option.label,
              option_order: index
            };
            return axios.put(`/options/${option.id}`, payload);
          }
          return Promise.resolve();
        });

        await Promise.all(updatePromises);

      } catch (err) {
        console.error("Error al guardar el nuevo orden:", err);
      }
    }
  };

  const optionIds = mappedOptions.map(opt => opt.id || opt.value);

  return (
    <>
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="¿Estás seguro que deseas eliminar esta opción?"
        message="Esta acción no se puede deshacer."
        actions={[
          { 
            label: "Cancelar", 
            onClick: () => setConfirmOpen(false), 
            variant: "outline" 
          },
          { 
            label: "Eliminar", 
            onClick: confirmDeleteOption, 
            variant: "destructive"
          },
        ]}
      />
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Opciones Personalizadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={optionIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {/* Lista de opciones existentes */}
                {mappedOptions.map((option, index) => (
                  //El drag and drop
                  <DraggableOption 
                    key={option.id || option.value}
                    option={option}
                    index={index}
                    onOptionChange={handleOptionChange}
                    onRemoveOption={handleRemoveOption}
                    onSaveOption={handleSaveOption}
                    editedOptions={editedOptions}
                    disabled={disabled}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

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

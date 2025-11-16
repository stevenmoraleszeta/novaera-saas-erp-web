"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Trash2 } from "lucide-react";

export default function DraggableOption({
  option,
  index,
  onOptionChange,
  onRemoveOption,
  onSaveOption,
  editedOptions, 
  disabled,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: option.id || option.value });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
    >
      <div {...attributes} {...listeners} className="cursor-move text-gray-400">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <Input
          value={option.label || option.value || ""}
          onChange={(e) => onOptionChange(index, e.target.value)}
          placeholder="Opción"
          disabled={disabled}
          className="h-8"
        />
      </div>

      {editedOptions[index] && option.id && (
        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={() => onSaveOption(option, index)}
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
        onClick={() => onRemoveOption(option, index)}
        disabled={disabled}
        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
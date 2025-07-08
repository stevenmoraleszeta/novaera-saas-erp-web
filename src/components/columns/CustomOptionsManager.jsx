"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";

export default function CustomOptionsManager({
  options = [],
  onChange,
  disabled = false,
}) {
  const [newOption, setNewOption] = useState("");

  const handleAddOption = () => {
    if (newOption.trim()) {
      const updatedOptions = [...options, newOption.trim()];
      onChange(updatedOptions);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    onChange(updatedOptions);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = options.map((option, i) => 
      i === index ? value : option
    );
    onChange(updatedOptions);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Opciones Personalizadas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de opciones existentes */}
        {options.length > 0 && (
          <div className="space-y-3">
            {options.map((option, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
              >
                <div className="cursor-move text-gray-400">
                  <GripVertical className="w-4 h-4" />
                </div>
                
                <div className="flex-1">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder="Opción"
                    disabled={disabled}
                    className="h-8"
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveOption(index)}
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
                disabled={disabled}
              />
            </div>
            
            <Button
              type="button"
              onClick={handleAddOption}
              disabled={disabled || !newOption.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>

        {options.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No hay opciones personalizadas agregadas</p>
            <p className="text-sm">Agrega opciones usando el campo de arriba</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Archivo: components/ui/ReusableCombobox.jsx (Nombre sugerido)

"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

// La lista de opciones ahora es un prop
export default function ReusableCombobox({
  value,
  onChange,
  options = [], // <-- NUEVO PROP: Array de { label: string, value: any }
  label = "",
  placeholder = "Seleccione una opción...", // Placeholder personalizable
  error,
  required = false,
}) {
  const [open, setOpen] = useState(false);

  // Encuentra el label del valor seleccionado
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="space-y-2">
      {label && ( // Solo muestra el label si se proporciona
        <Label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11"
          >
            {selectedLabel || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0" 
          side="bottom" 
          align="start"
          collisionPadding={{ top: 100, bottom: 100 }}
        >
          <Command
            filter={(itemValue, search) => {
              const item = options.find(d => String(d.value) === itemValue);
              const itemLabel = item?.label || '';
              const normalizeText = (text) => 
                text
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase();

              if (normalizeText(itemLabel).includes(normalizeText(search))) {
                return 1; 
              }
              return 0; 
            }}
          >
            <CommandList className="max-h-[var(--radix-popover-content-available-height)]">
              <CommandInput placeholder="Buscar..." />
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={String(option.value)} // El valor debe ser string para Command
                    onSelect={(currentValue) => {
                      // Encuentra el valor original (puede no ser string)
                      const originalValue = options.find(o => String(o.value) === currentValue)?.value;
                      onChange(originalValue === value ? "" : originalValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label} 
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
}
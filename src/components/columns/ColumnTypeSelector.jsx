//Ya no se está usando, pero igual es mejor revisar bien por cualquier cosas

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

const DATA_TYPES = [
  { label: "Texto", value: "string" },
  { label: "Texto largo", value: "text" },
  { label: "Número entero", value: "integer" },
  { label: "Número decimal", value: "decimal" },
  { label: "Checkbox", value: "boolean" },
  { label: "Fecha", value: "date" },
  { label: "Fecha y hora", value: "datetime" },
  { label: "Relación Foránea", value: "foreign" },
  { label: "Selección", value: "select" },
  { label: "Archivo", value: "file" },
  { label: "Múltiples archivos", value: "file_array" },
  { label: "Usuario", value: "user" },
  { label: "Usuarios Asignados", value: "assigned_users" },
  { label: "JSON", value: "json" },
  { label: "UUID", value: "uuid" },
  { label: "Tabla", value: "tabla" },
];

export default function ColumnTypeSelector({
  value,
  onChange,
  error,
  label = "",
  required = false,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11"
          >
            {value
              ? DATA_TYPES.find((type) => type.value === value)?.label
              : "Seleccione un tipo de dato..."}
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
            filter={(value, search) => {
              const item = DATA_TYPES.find(d => d.value === value);
              const label = item?.label || '';
              const normalizeText = (text) => 
                text
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase();

              const normalizedLabel = normalizeText(label);
              const normalizedSearch = normalizeText(search);

              if (normalizedLabel.includes(normalizedSearch)) {
                return 1; 
              }
              return 0; 
            }}
          >
            
            <CommandList className="max-h-[var(--radix-popover-content-available-height)]">
              <CommandInput placeholder="Buscar tipo de dato..." />
            <CommandEmpty>No se encontró el tipo de dato.</CommandEmpty>
              <CommandGroup>
                {DATA_TYPES.map((type) => (
                  <CommandItem
                    key={type.value}
                    value={type.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === type.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {type.label} 
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
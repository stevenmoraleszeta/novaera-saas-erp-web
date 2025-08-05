"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, ChevronDown, SquareArrowOutUpRight } from "lucide-react";

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

export default function ReusableCombobox({
  value,
  onChange,
  options = [],
  label = "",
  placeholder = "Seleccione una opción...", 
  error,
  required = false,
  disabled = false,
  triggerClassName = "",
  onRedirectClick,
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="space-y-2">
      {label && ( 
        <Label className="text-sm font-black">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            aria-expanded={open}
            className={cn(
             "flex h-11 flex-1 items-center justify-between border border-transparent bg-gray-200 hover:bg-gray-200 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-800",
              triggerClassName
            )}
          >
            {selectedLabel || placeholder}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 10 5"
              fill="currentColor"
              className="ml-2 !h-[20px] !w-[25px] shrink-0" 
            >
              <path d="M0 0L5 5L10 0Z" />
            </svg>
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
                String(text || "")
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
                    value={String(option.value)}
                    onSelect={(currentValue) => {
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
      {onRedirectClick && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          onClick={onRedirectClick}
          className="h-11 w-11 flex-shrink-0 border-gray-300" 
        >
          <SquareArrowOutUpRight className="w-5 h-5" />
        </Button>
      )}
      </div>
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
}
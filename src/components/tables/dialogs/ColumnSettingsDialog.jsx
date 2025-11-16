import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ColumnSettingsDialog({
  open,
  onOpenChange,
  columns,
  columnVisibility,
  setColumnVisibility,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuración de Columnas</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {columns.map((col) => (
            <div key={col.name} className="flex items-center space-x-3">
              <Checkbox
                id={`col-${col.name}`}
                checked={columnVisibility[col.name] !== false}
                onCheckedChange={(checked) => {
                  setColumnVisibility((prev) => ({
                    ...prev,
                    [col.name]: checked,
                  }));
                }}
              />
              <label
                htmlFor={`col-${col.name}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {col.name}
              </label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

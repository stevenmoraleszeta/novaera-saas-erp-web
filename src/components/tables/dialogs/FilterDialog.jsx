import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function FilterDialog({
  open,
  onOpenChange,
  columns,
  filterConditions = [],
  filterDraft,
  setFilterDraft,
  onAddFilter,
  columnVisibility,
  setColumnVisibility,
}) {
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtros {columnVisibility && "y Columnas"}</DialogTitle>
        </DialogHeader>

        {/* FILTROS */}
        <div className="flex flex-col gap-4 mb-6 border-b pb-6">
          <h4 className="text-sm font-semibold">Agregar Filtro</h4>

          <Select
            value={filterDraft.column}
            onValueChange={(val) =>
              setFilterDraft((d) => ({ ...d, column: val }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Columna" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((col) => (
                <SelectItem key={col.column_id} value={col.name}>
                  {col.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterDraft.condition}
            onValueChange={(val) =>
              setFilterDraft((d) => ({ ...d, condition: val }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Condición" />
            </SelectTrigger>
            <SelectContent>
              {filterConditions.map((cond) => (
                <SelectItem key={cond.value} value={cond.value}>
                  {cond.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filterDraft.condition &&
            !["is_null", "is_not_null"].includes(filterDraft.condition) && (
              <input
                className="border rounded px-3 py-2 text-sm"
                placeholder="Valor"
                value={filterDraft.value}
                onChange={(e) =>
                  setFilterDraft((d) => ({ ...d, value: e.target.value }))
                }
              />
            )}

          <Button
            onClick={onAddFilter}
            disabled={
              !filterDraft.column ||
              !filterDraft.condition ||
              (filterDraft.condition !== "is_null" &&
                filterDraft.condition !== "is_not_null" &&
                !filterDraft.value)
            }
          >
            Agregar filtro
          </Button>
        </div>

        {/* Column visibility (opcional) */}
        {columnVisibility && setColumnVisibility && (
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">Mostrar u ocultar columnas</h4>
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
                  className="text-sm font-medium leading-none"
                >
                  {col.name}
                </label>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="pt-6">
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

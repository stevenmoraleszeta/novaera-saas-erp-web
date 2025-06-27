import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  filterConditions,
  filterDraft,
  setFilterDraft,
  onAddFilter,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
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
                <SelectItem key={col.name} value={col.name}>
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
        </div>
        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

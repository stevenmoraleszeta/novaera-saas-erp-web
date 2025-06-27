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

export default function SortDialog({
  open,
  onOpenChange,
  columns,
  sortConfig,
  setSortConfig,
  onSetSort,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ordenamiento</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Select
            value={sortConfig?.column || ""}
            onValueChange={(val) =>
              setSortConfig((cfg) => ({ ...cfg, column: val }))
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
            value={sortConfig?.direction || ""}
            onValueChange={(val) =>
              setSortConfig((cfg) => ({ ...cfg, direction: val }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Dirección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascendente</SelectItem>
              <SelectItem value="desc">Descendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            onClick={onSetSort}
            disabled={!sortConfig?.column || !sortConfig?.direction}
          >
            Aplicar orden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

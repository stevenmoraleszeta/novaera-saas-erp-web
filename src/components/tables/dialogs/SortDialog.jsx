import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ReusableCombobox from "@/components/ui/reusableCombobox";

export default function SortDialog({
  open,
  onOpenChange,
  columns,
  sortConfig,
  setSortConfig,
  onSetSort,
}) {

  const columnOptions = columns.map((col) => ({
    value: col.name,
    label: col.header || col.name || col.column_id,
  }));

  const directionOptions = [
    { value: "asc", label: "Ascendente" },
    { value: "desc", label: "Descendente" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ordenamiento</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <ReusableCombobox
            placeholder="Columna"
            options={columnOptions}
            value={sortConfig?.column || ""}
            onChange={(val) =>
              setSortConfig((cfg) => ({ ...cfg, column: val }))}
          />
          <ReusableCombobox
            placeholder="Dirección"
            options={directionOptions}
            value={sortConfig?.direction || ""}
            onChange={(val) =>
              setSortConfig((cfg) => ({ ...cfg, direction: val }))}
          />
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

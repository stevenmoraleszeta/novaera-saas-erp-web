import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function UserLinkDialog({
  open,
  onConfirm,
  onCancel,
  createdBy,
}) {
  const [columnName, setColumnName] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!columnName.trim()) return;
    setSubmitting(true);

    const newColumn = {
      name: columnName.trim(),
      data_type: "user",
      is_required: isRequired,
      is_foreign_key: false,
      relation_type: "",
      foreign_table_id: 0,
      foreign_column_name: "",
      foreign_column_id: "",
      validations: "",
      created_by: createdBy,
      column_position: 0,
    };

    await onConfirm(newColumn);
    setSubmitting(false);
    setColumnName("");
    setIsRequired(false);
  };

  const handleCancel = () => {
    setColumnName("");
    setIsRequired(false);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Deseas vincular esta tabla con los usuarios?</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="columnName">Nombre de la columna</Label>
            <Input
              id="columnName"
              placeholder="Ej: usuario_responsable"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={isRequired}
              onCheckedChange={(val) => setIsRequired(val)}
            />
            <Label htmlFor="required">Es obligatorio</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={submitting || !columnName}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function UserLinkDialog({
  open,
  onConfirm,
  onCancel,
  createdBy,
}) {
  const [isRequired, setIsRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);

    const newColumn = {
      name: "Usuario", // nombre fijo
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
    setIsRequired(false);
  };

  const handleCancel = () => {
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
          <div>
            <p className="text-sm text-gray-600">
              Se creará una columna llamada <strong>Usuario</strong> para asociar esta tabla con un usuario.
            </p>
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
          <Button onClick={handleConfirm} disabled={submitting}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

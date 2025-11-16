import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Database, Table } from "lucide-react";

export default function ModuleDeleteConfirmationModal({
  open = false,
  onOpenChange,
  moduleName,
  onConfirm,
  onCancel,
  loading = false,
}) {
  const [deleteCascade, setDeleteCascade] = useState(true);

  const handleConfirm = () => {
    onConfirm(deleteCascade);
  };

  const handleCancel = () => {
    setDeleteCascade(true); // Reset to default
    if (onCancel) onCancel();
    else onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ¿Eliminar módulo?
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              Esta acción eliminará permanentemente el módulo{" "}
              <span className="font-semibold">"{moduleName}"</span>.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Database className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-amber-800 font-medium">
                    Eliminación en cascada
                  </p>
                  <p className="text-xs text-amber-700">
                    Al eliminar el módulo también se eliminarán todas las tablas, 
                    columnas y registros asociados a este módulo.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="cascade-delete"
                checked={deleteCascade}
                onCheckedChange={setDeleteCascade}
              />
              <label
                htmlFor="cascade-delete"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <Table className="h-4 w-4" />
                Eliminar tablas relacionadas
              </label>
            </div>

            {!deleteCascade && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Nota:</strong> Si desactivas esta opción, solo se eliminará 
                  el módulo. Las tablas relacionadas quedarán sin módulo asignado.
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? "Eliminando..." : "Sí, eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

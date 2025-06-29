// components/forms/ViewForm.js
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ViewForm({
  open,
  mode = "create",
  initialData = null,
  activeSort = null,
  activeFilters = [],
  onSubmit,
  onClose,
}) {
  const [name, setName] = useState(initialData?.name || "");

  useEffect(() => {
    setName(initialData?.name || "");
  }, [initialData]);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Por favor ingrese un nombre para la vista");
      return;
    }

    onSubmit({ name: name.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva Vista" : "Editar Vista"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label>Nombre de la Vista</Label>
          <Input
            type="text"
            placeholder="Ingrese el nombre de la vista"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="text-sm text-gray-600">
            <p>Esta vista guardará:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {activeSort?.column && (
                <li>
                  Ordenamiento: {activeSort.column} ({activeSort.direction})
                </li>
              )}
              {activeFilters.length > 0 && (
                <li>{activeFilters.length} filtro(s) aplicado(s)</li>
              )}
              <li>Configuración de columnas visibles</li>
            </ul>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {mode === "create" ? "Crear" : "Actualizar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

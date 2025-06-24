import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Database, FileText, Hash, Trash2 } from "lucide-react";
import useEditModeStore from "@/stores/editModeStore";
import DeleteLogicalTableButton from "./DeleteLogicalTableButton";

export default function LogicalTableDetails({
  table,
  editFields,
  isDirty,
  saving,
  saveError,
  onFieldChange,
  onSaveChanges,
  onDeleteTable,
}) {
  const { isEditingMode } = useEditModeStore();

  // Check if values are actually different from original
  const hasChanges =
    isEditingMode &&
    ((editFields.name !== undefined && editFields.name !== table?.name) ||
      (editFields.description !== undefined &&
        editFields.description !== table?.description));

  if (!table) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Selecciona una tabla</h3>
          <p className="text-sm">
            Elige una tabla lógica del panel izquierdo para ver sus detalles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-black" />
              <CardTitle className="text-xl">
                {isEditingMode ? (
                  <Input
                    type="text"
                    value={editFields.name ?? table.name ?? ""}
                    onChange={(e) => onFieldChange("name", e.target.value)}
                    className="text-xl font-semibold border-0 p-0 bg-transparent focus-visible:ring-0"
                  />
                ) : (
                  table.name
                )}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Tabla lógica
              </Badge>

              {/* Action Icons */}
              {isEditingMode && (
                <>
                  <Button
                    onClick={onSaveChanges}
                    disabled={saving || !hasChanges}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                    title="Guardar cambios"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 text-blue-600" />
                    )}
                  </Button>
                  <DeleteLogicalTableButton
                    onDelete={() => onDeleteTable(table)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </DeleteLogicalTableButton>
                  {hasChanges && (
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-200 text-xs"
                    >
                      Sin guardar
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Error Message */}
        {saveError && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  Descripción
                </label>
                {isEditingMode ? (
                  <Input
                    type="text"
                    value={editFields.description ?? table.description ?? ""}
                    onChange={(e) =>
                      onFieldChange("description", e.target.value)
                    }
                    placeholder="Describe el propósito de esta tabla..."
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-600 text-sm">
                    {table.description || "Sin descripción"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4" />
                  Cantidad de columnas
                </label>
                <p className="text-gray-600 text-sm">
                  {table.columnCount ?? "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  ID de la tabla
                </label>
                <p className="text-gray-600 text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                  {table.id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Estado
                </label>
                <Badge variant="secondary" className="text-xs">
                  Activa
                </Badge>
              </div>
            </div>
          </div>

          {/* Placeholder for future columns section */}
          <div className="border-t pt-6">
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h4 className="font-medium mb-2">Columnas de la tabla</h4>
              <p className="text-sm">
                Aquí se mostrarán las columnas de la tabla seleccionada
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

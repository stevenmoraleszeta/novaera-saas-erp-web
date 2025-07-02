import React, { useEffect, useState } from "react";
import { useColumns } from "@/hooks/useColumns";
import ColumnListTable from "./ColumnListTable";
import ColumnForm from "./ColumnForm";
import TablePreview from "../tables/TablePreview";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";

export default function ColumnManager({ tableId, tableName, onRefresh }) {
  const {
    columns,
    loading,
    error,
    fetchColumns,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleUpdatePosition,
  } = useColumns(tableId);

  const [selectedColumn, setSelectedColumn] = useState(null);
  const [formMode, setFormMode] = useState("create");
  const [formOpen, setFormOpen] = useState(false);

  const [columnToDelete, setColumnToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [visibleError, setVisibleError] = useState(null);

  useEffect(() => {
    if (tableId) fetchColumns();
  }, [tableId, fetchColumns]);

  const handleDeleteClick = (column) => {
    setColumnToDelete(column);
    setShowDeleteDialog(true);
  };

  useEffect(() => {
    if (error) {
      setVisibleError(error);
      const timeout = setTimeout(() => {
        setVisibleError(null);
      }, 5000); // 5 segundos

      return () => clearTimeout(timeout); // limpiar si cambia antes
    }
  }, [error]);

  const handleConfirmDelete = async () => {
    try {
      await handleDelete(columnToDelete);
      setShowDeleteDialog(false);
      setColumnToDelete(null);
      setFormOpen(false); // cerrar el modal si se estaba editando
      onRefresh();
    } catch (err) {
      console.error("Error al eliminar la columna:", err);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setColumnToDelete(null);
  };

  const handleFormSubmit = async (formData) => {
    if (formMode === "create") {
      await handleCreate(formData);
    } else if (formMode === "edit" && selectedColumn) {
      await handleUpdate(selectedColumn.id, formData);
    }
    setFormOpen(false);
    setSelectedColumn(null);
    setFormMode("create");
    onRefresh();
  };

  const handleFormCancel = () => {
    setFormOpen(false);
    setSelectedColumn(null);
    setFormMode("create");
  };

  const handleCreateCol = () => {
    setSelectedColumn(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const handleEdit = (column) => {
    setSelectedColumn(column);
    setFormMode("edit");
    setFormOpen(true);
  };

  return (
    <div className="flex-1 p-6 overflow-hidden">

          {visibleError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg transition-all">
              <p className="text-sm text-red-700">{visibleError}</p>
            </div>
          )}

          <div className="flex-1 overflow-auto">
            <ColumnListTable
              columns={columns}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onAdd={handleCreateCol}
              onReorder={(reorderedCols) => {
                reorderedCols.forEach((col, index) => {
                  handleUpdatePosition(col.id, index + 1);
                });
              }}
            />
          </div>

    </div>
  );
}

// components/common/GenericCRUDTable.jsx
"use client";

import { useState } from "react";
import Table from "@/components/tables/Table";
import { Button } from "@/components/ui/button";

export default function GenericCRUDTable({
  title,
  data = [],
  columns = [],
  getRowKey = (row) => row.id,
  onCreate,
  onUpdate,
  onDelete,
  renderForm,
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);

  const handleNew = () => {
    setFormMode("create");
    setSelectedItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item) => {
    setFormMode("edit");
    setSelectedItem(item);
    setFormOpen(true);
  };

  const handleDelete = (item) => {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
      onDelete?.(item);
    }
  };

  const extendedColumns = [
    ...columns,
    {
      key: "__actions",
      header: "Acciones",
      render: (value, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>
            Editar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{title}</h2>
        <Button onClick={handleNew}>Nuevo</Button>
      </div>

      <Table
        columns={extendedColumns}
        data={data}
        getRowKey={getRowKey}
        pagination={true}
      />

      {/* Render del formulario externo (modal, etc) */}
      {renderForm && renderForm({
        mode: formMode,
        item: selectedItem,
        open: formOpen,
        onClose: () => setFormOpen(false),
        onSubmit: (formData) => {
          if (formMode === "create") {
            onCreate?.(formData);
          } else {
            onUpdate?.(selectedItem?.id, formData);
          }
          setFormOpen(false);
        },
      })}
    </div>
  );
}

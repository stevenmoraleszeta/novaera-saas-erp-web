"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

function SortableRow({ column, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClickEdit = (e) => {
    e.stopPropagation();
    if (isDragging) return;
    onEdit(column);
  };

  const handleClickDelete = (e) => {
    e.stopPropagation();
    if (isDragging) return;
    onDelete(column.id);
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="hover:bg-muted transition-colors"
    >
      <td className="p-3">{column.name}</td>
      <td className="p-3 capitalize">{column.data_type}</td>
      <td className="p-3">
        {column.is_required ? (
          <Badge variant="default">Sí</Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
        )}
      </td>
      <td className="p-3">{column.relation_type || "-"}</td>
      <td className="p-3">{column.foreign_column_name || "-"}</td>
      <td className="p-3 text-sm text-muted-foreground">
        {Array.isArray(column.validations)
          ? column.validations.join(", ")
          : column.validations || "-"}
      </td>
      <td className="p-3 flex gap-2">
        <Button variant="outline" size="sm" onClick={handleClickEdit}>
          <Pencil className="w-4 h-4 mr-1" /> Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={handleClickDelete}>
          <Trash2 className="w-4 h-4 mr-1" /> Eliminar
        </Button>
      </td>
    </tr>
  );
}

export default function ColumnListTable({
  columns = [],
  onEdit,
  onDelete,
  onAdd,
  onReorder,
  loading = false,
}) {
  const [items, setItems] = React.useState(columns.map((col) => col.id));

  React.useEffect(() => {
    setItems(columns.map((col) => col.id));
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      setItems(newOrder);

      const reordered = newOrder.map((id) =>
        columns.find((col) => col.id === id)
      );
      onReorder?.(reordered);
    }
  };

  return (
    <div className="mt-4 rounded-xl bg-white border shadow-sm overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">¿Requerida?</th>
                <th className="p-3 text-left">Relación</th>
                <th className="p-3 text-left">Llave Foránea</th>
                <th className="p-3 text-left">Validaciones</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {columns.length === 0 && !loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-muted-foreground">
                    No hay columnas registradas.
                  </td>
                </tr>
              ) : (
                items.map((id) => {
                  const col = columns.find((c) => c.id === id);
                  if (!col) return null;
                  return (
                    <SortableRow
                      key={col.id}
                      column={col}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  );
                })
              )}
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <Button onClick={onAdd} variant="default" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Agregar columna
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  );
}

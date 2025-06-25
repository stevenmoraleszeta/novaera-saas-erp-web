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
import { Plus, Edit3, Trash2, GripVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`hover:bg-muted transition-colors`}
    >
      <TableCell className="p-3">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <span className="font-medium">{column.name}</span>
        </div>
      </TableCell>
      <TableCell className="p-3">
        <Badge variant="outline" className="capitalize">
          {column.data_type}
        </Badge>
      </TableCell>
      <TableCell className="p-3">
        {column.is_required ? (
          <Badge variant="default" className="bg-green-600">
            Sí
          </Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
        )}
      </TableCell>
      <TableCell className="p-3">
        <span className="text-sm text-muted-foreground">
          {column.relation_type || "-"}
        </span>
      </TableCell>
      <TableCell className="p-3">
        <span className="text-sm text-muted-foreground">
          {column.foreign_column_name || "-"}
        </span>
      </TableCell>
      <TableCell className="p-3">
        <span className="text-sm text-muted-foreground">
          {Array.isArray(column.validations)
            ? column.validations.join(", ")
            : column.validations || "-"}
        </span>
      </TableCell>
      <TableCell className="p-3">
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClickEdit}
            className="h-7 px-2"
          >
            <Edit3 className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClickDelete}
            className="h-7 px-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
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
  const [items, setItems] = React.useState(columns.map((col) => col));

  React.useEffect(() => {
    setItems(columns.map((col) => col));
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
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      setItems(newOrder);

      onReorder?.(newOrder);
    }
  };

  const handleDragStart = (event) => {
    // Drag start event handler
  };

  return (
    <div className="rounded-lg border bg-white">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="p-3 text-left font-medium text-muted-foreground">
                  Nombre
                </TableHead>
                <TableHead className="p-3 text-left font-medium text-muted-foreground">
                  Tipo
                </TableHead>
                <TableHead className="p-3 text-left font-medium text-muted-foreground">
                  ¿Requerida?
                </TableHead>
                <TableHead className="p-3 text-left font-medium text-muted-foreground">
                  Relación
                </TableHead>
                <TableHead className="p-3 text-left font-medium text-muted-foreground">
                  Llave Foránea
                </TableHead>
                <TableHead className="p-3 text-left font-medium text-muted-foreground">
                  Validaciones
                </TableHead>
                <TableHead className="p-3 text-left font-medium text-muted-foreground">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.length === 0 && !loading ? (
                <TableRow>
                  <TableCell
                    colSpan="7"
                    className="text-center py-8 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-sm font-medium">
                        No hay columnas registradas
                      </span>
                      <span className="text-xs">
                        Agrega tu primera columna para comenzar
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((col) => {
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
              <TableRow>
                <TableCell colSpan="7" className="text-center py-4">
                  <Button
                    onClick={onAdd}
                    variant="outline"
                    size="sm"
                    className="bg-white"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Agregar columna
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </SortableContext>
      </DndContext>
    </div>
  );
}

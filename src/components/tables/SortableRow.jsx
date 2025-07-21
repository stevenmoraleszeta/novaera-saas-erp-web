"use client";

import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableRow({
  row,
  rowIndex,
  onRowClick,
  visibleColumnsList,
  columnWidths,
  getRowKey,
  idRow,
}) {

  let id;
  if (idRow) {
    id = idRow;
  } else {
    id = getRowKey?.(row) ?? row.id ?? rowIndex;
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: "row" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging && { opacity: 0.5 }),
  };


  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={() => onRowClick?.(row)}
      className={`${onRowClick ? "cursor-pointer hover:bg-[#f0f0f0]" : ""
        } ${rowIndex % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#f7f3f2]"}`}
    >
      {/* Handle de drag a la izquierda */}
      <TableCell className="w-4 px-2 cursor-grab text-gray-400 select-none">
        <div {...listeners}>
          <GripVertical className="h-4 w-4" />
        </div>
      </TableCell>

      {/* Resto de columnas */}
      {visibleColumnsList.map((column) => {
        return (
          <TableCell key={column.key || column.name}>
            {typeof row[column.key] === "boolean"
              ? row[column.key] ? "Sí" : "No"
              : column.render
                ? column.render(row[column.key], row)
                : row[column.key]}
          </TableCell>
        );
      })}
    </TableRow>
  );
}

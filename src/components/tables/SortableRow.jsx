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
if(idRow){
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
  } = useSortable({ id });

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
      className={`${
        onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
      } ${rowIndex % 2 === 0 ? "bg-white" : "bg-[#F6F3F3]"}`}
    >
      {/* Handle de drag a la izquierda */}
      <TableCell className="w-4 px-2 cursor-grab text-gray-400 select-none">
        <div {...listeners}>
          <GripVertical className="h-4 w-4" />
        </div>
      </TableCell>

      {/* Resto de columnas */}
      {visibleColumnsList.map((column) => (
        <TableCell
          key={column.key}
          style={{
            width: columnWidths[column.key],
            minWidth: "100px",
          }}
          className="truncate"
        >
          {column.render
            ? column.render(row[column.key], row)
            : row[column.key]}
        </TableCell>
      ))}
    </TableRow>
  );
}

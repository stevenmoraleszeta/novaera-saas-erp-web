"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GripVertical } from "lucide-react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableRow from "./SortableRow";

export default function Table({
  columns = [],
  data = [],
  onRowClick,
  className = "",
  getRowKey = (row) => row.id,
  onOrderChange,
}) {

  const [internalData, setInternalData] = useState(data);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );
  const [columnWidths, setColumnWidths] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: "200px" }), {})
  );
  const [resizingColumn, setResizingColumn] = useState(null);
  const resizeStateRef = useRef({});

  useEffect(() => {
    setInternalData(data);
  }, [data]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleResizeStart = useCallback((e, columnKey) => {
    e.preventDefault();
    e.stopPropagation();
    const currentWidth = parseInt(columnWidths[columnKey]) || 200;

    resizeStateRef.current = {
      resizingColumn: columnKey,
      startX: e.clientX,
      startWidth: currentWidth,
    };

    document.addEventListener("mousemove", handleResizeMove, { capture: true });
    document.addEventListener("mouseup", handleResizeEnd, { capture: true });

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    setResizingColumn(columnKey);
  }, [columnWidths]);

  const handleResizeMove = useCallback((e) => {
    const state = resizeStateRef.current;
    if (!state.resizingColumn) return;

    const deltaX = e.clientX - state.startX;
    const newWidth = Math.max(100, state.startWidth + deltaX);

    setColumnWidths((prev) => ({
      ...prev,
      [state.resizingColumn]: `${newWidth}px`,
    }));
  }, []);

  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
    resizeStateRef.current = {};

    document.removeEventListener("mousemove", handleResizeMove, {
      capture: true,
    });
    document.removeEventListener("mouseup", handleResizeEnd, { capture: true });

    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = internalData.findIndex(
      (item) => getRowKey(item) === active.id
    );
    const newIndex = internalData.findIndex(
      (item) => getRowKey(item) === over.id
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(internalData, oldIndex, newIndex);
    setInternalData(newOrder);
    onOrderChange?.(newOrder);
  };

  const visibleColumnsList = columns.filter((col) => visibleColumns[col.key]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="overflow-x-auto bg-gray-50">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={internalData.map((item) => getRowKey(item))}
            strategy={verticalListSortingStrategy}
          >
            <TableUI>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6">&nbsp;</TableHead>
                  {visibleColumnsList.map((column) => (
                    <TableHead
                      key={column.key}
                      style={{
                        width: columnWidths[column.key],
                        minWidth: "100px",
                        position: "relative",
                      }}
                      className="cursor-pointer hover:bg-gray-50 select-none"
                    >
                      <div className="flex items-center justify-between pr-2">
                        <span className="truncate">{column.header}</span>
                      </div>

                      <div
                        className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize ${
                          resizingColumn === column.key
                            ? "bg-black"
                            : "bg-transparent hover:bg-gray-300"
                        }`}
                        onMouseDown={(e) => handleResizeStart(e, column.key)}
                        style={{ zIndex: 10 }}
                      >
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-0.5 h-8 bg-gray-400 rounded opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {internalData.length > 0 ? (
                  internalData.map((row, index) => (
                    <SortableRow
                      key={getRowKey(row)}
                      id={getRowKey(row)}
                      idRow={getRowKey(row)}
                      row={row}
                      onRowClick={onRowClick}
                      visibleColumnsList={visibleColumnsList}
                      columnWidths={columnWidths}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumnsList.length + 1}
                      className="text-center text-gray-400"
                    >
                      Sin datos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </TableUI>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

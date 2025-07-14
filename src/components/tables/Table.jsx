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
  DragOverlay
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";


import { restrictToHorizontalAxis, restrictToVerticalAxis } from "@dnd-kit/modifiers";

import SortableRow from "./SortableRow";
import SortableColumnHeader from "./SortableColumnHeader";

export default function Table({
  columns = [],
  data = [],
  onRowClick,
  className = "",
  getRowKey = (row) => row.id,
  onOrderChange,
  onOrderColumnChange,
  onColumnResize,
  columnWidths: externalColumnWidths,
  isDraggableColumnEnabled
}) {

  const [activeColumn, setActiveColumn] = useState(null);
  const [orderedColumns, setOrderedColumns] = useState(columns.map((col) => col.key));
  const [isDraggingEnabled, setIsDraggingEnabled] = useState(false);

  const [dragType, setDragType] = useState(null);

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

  useEffect(() => {
    const hasWidths =
      externalColumnWidths && Object.keys(externalColumnWidths).length > 0;

    if (hasWidths) {
      setColumnWidths(externalColumnWidths);
      console.log("bro ✅ Se aplicaron tamaños externos:", externalColumnWidths);
    }
  }, [externalColumnWidths]);

  useEffect(() => {
    if (columns.length > 0) {
      setOrderedColumns(columns.map((col) => col.key));
      setVisibleColumns(columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}));

      const hasWidths =
        externalColumnWidths && Object.keys(externalColumnWidths).length > 0;

      if (!hasWidths) {
        console.log("bro ⚠️ Usando tamaños por defecto");
        setColumnWidths(columns.reduce((acc, col) => ({ ...acc, [col.key]: "200px" }), {}));
      }
    }
  }, [columns]);

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

    // Actualizar el ref directamente también
    state.finalWidth = newWidth;

    setColumnWidths((prev) => ({
      ...prev,
      [state.resizingColumn]: `${newWidth}px`,
    }));
  }, []);

  const handleResizeEnd = useCallback(() => {
    const state = resizeStateRef.current;
    setResizingColumn(null);
    resizeStateRef.current = {};

    document.removeEventListener("mousemove", handleResizeMove, { capture: true });
    document.removeEventListener("mouseup", handleResizeEnd, { capture: true });

    document.body.style.userSelect = "";
    document.body.style.cursor = "";

    if (onColumnResize && state.resizingColumn && state.finalWidth) {
      const finalWidthPx = `${state.finalWidth}px`;
      console.log("djo ✅ Final width:", finalWidthPx);
      onColumnResize(state.resizingColumn, finalWidthPx);
    }
  }, [handleResizeMove, onColumnResize]);



  const handleDragStart = (event) => {
    const id = event.active.id;

    if (orderedColumns.includes(id)) {
      const column = columns.find((c) => c.key === id);
      setActiveColumn(column);
      setDragType("column");
    } else if (internalData.some((row) => getRowKey(row) === id)) {
      setDragType("row");
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) {
      setIsDraggingEnabled(false);
      return;
    }

    if (dragType === "column") {
      const oldIndex = orderedColumns.indexOf(active.id);
      const newIndex = orderedColumns.indexOf(over.id);
      const newOrder = arrayMove(orderedColumns, oldIndex, newIndex);
      setOrderedColumns(newOrder);
      onOrderColumnChange?.(newOrder);
    }

    if (dragType === "row") {
      const oldIndex = internalData.findIndex(item => getRowKey(item) === active.id);
      const newIndex = internalData.findIndex(item => getRowKey(item) === over.id);
      const newOrder = arrayMove(internalData, oldIndex, newIndex);
      setInternalData(newOrder);
      onOrderChange?.(newOrder);
    }

    setIsDraggingEnabled(false);
    setDragType(null);
    setActiveColumn(null);
  };

  const getModifiers = () => {
    if (dragType === "column") return [restrictToHorizontalAxis];
    if (dragType === "row") return [restrictToVerticalAxis];
    return [];
  };



  const visibleColumnsList = orderedColumns
    .map((key) => columns.find((col) => col.key === key))
    .filter((col) => !!col && visibleColumns[col.key]);



  const handleColumnDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = orderedColumns.indexOf(active.id);
    const newIndex = orderedColumns.indexOf(over.id);

    const newOrder = arrayMove(orderedColumns, oldIndex, newIndex);
    setOrderedColumns(newOrder);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="overflow-x-auto bg-gray-50">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={getModifiers()}
        >
          <SortableContext
            items={
              dragType === "column"
                ? orderedColumns
                : internalData.map((item) => getRowKey(item))
            }
            strategy={
              dragType === "column"
                ? horizontalListSortingStrategy
                : verticalListSortingStrategy
            }
          >
            <DragOverlay>
              {dragType === "column" && activeColumn ? (
                <div
                  className="bg-#f7f3f2 border px-2 py-1 shadow-md"
                  style={{
                    width: columnWidths[activeColumn.key],
                    minWidth: columnWidths[activeColumn.key],
                    maxWidth: columnWidths[activeColumn.key],
                  }}
                >
                  {activeColumn.header}
                </div>
              ) : null}
            </DragOverlay>

            <TableUI>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6">&nbsp;</TableHead>
                  {orderedColumns.map((key) => {
                    const column = columns.find((c) => c.key === key);

                    if (!column || !visibleColumns[column.key]) return null;
                    return (
                      <SortableColumnHeader
                        key={column.key}
                        column={column}
                        columnWidths={columnWidths}
                        resizingColumn={resizingColumn}
                        handleResizeStart={handleResizeStart}
                        onColumnDragEnd={handleColumnDragEnd}
                        isDraggingEnabled={isDraggingEnabled}
                        setIsDraggingEnabled={setIsDraggingEnabled}
                        isDraggableColumnEnabled ={isDraggableColumnEnabled}
                      />
                    );
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {internalData.length > 0 ? (
                  internalData.map((row, index) => (
                    <SortableRow
                      key={getRowKey(row)}
                      id={getRowKey(row)}
                      idRow={getRowKey(row)}
                      rowIndex={index}
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

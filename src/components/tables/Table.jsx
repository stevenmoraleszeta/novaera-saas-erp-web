"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Settings,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";

export default function Table({
  columns = [],
  data = [],
  onRowClick,
  pagination = true,
  itemsPerPageOptions = [10, 25, 50, 100],
  defaultItemsPerPage = 10,
  customizable = true,
  resizable = true,
  className = "",
  ...props
}) {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );
  const [columnWidths, setColumnWidths] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: "200px" }), {})
  );
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState(null);

  const tableRef = useRef(null);
  const resizeStateRef = useRef({
    isResizing: false,
    resizingColumn: null,
    startX: 0,
    startWidth: 0,
  });

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return data;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage, pagination]);

  // Get visible columns
  const visibleColumnsList = columns.filter((col) => visibleColumns[col.key]);

  // Calculate pagination info
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, data.length);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Handle column width change
  const updateColumnWidth = (columnKey, width) => {
    setColumnWidths((prev) => ({
      ...prev,
      [columnKey]: width,
    }));
  };

  // Column resizing handlers
  const handleResizeStart = useCallback(
    (e, columnKey) => {
      if (!resizable) return;

      e.preventDefault();
      e.stopPropagation();

      const currentWidth = parseInt(columnWidths[columnKey]) || 200;

      // Update both state and ref
      setIsResizing(true);
      setResizingColumn(columnKey);
      resizeStateRef.current = {
        isResizing: true,
        resizingColumn: columnKey,
        startX: e.clientX,
        startWidth: currentWidth,
      };

      // Add event listeners with capture phase
      document.addEventListener("mousemove", handleResizeMove, {
        capture: true,
      });
      document.addEventListener("mouseup", handleResizeEnd, { capture: true });

      // Prevent text selection during resize
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    },
    [resizable, columnWidths]
  );

  const handleResizeMove = useCallback(
    (e) => {
      const state = resizeStateRef.current;
      if (!state.isResizing || !state.resizingColumn) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const deltaX = e.clientX - state.startX;
      const newWidth = Math.max(100, state.startWidth + deltaX);

      setColumnWidths((prev) => ({
        ...prev,
        [state.resizingColumn]: `${newWidth}px`,
      }));
    },
    [columnWidths]
  );

  const handleResizeEnd = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Reset both state and ref
    setIsResizing(false);
    setResizingColumn(null);
    resizeStateRef.current = {
      isResizing: false,
      resizingColumn: null,
      startX: 0,
      startWidth: 0,
    };

    // Remove event listeners
    document.removeEventListener("mousemove", handleResizeMove, {
      capture: true,
    });
    document.removeEventListener("mouseup", handleResizeEnd, { capture: true });

    // Restore cursor and text selection
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Results info */}
      {/* <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Mostrando {startItem}-{endItem} de {data.length} resultados
        </span>
        {pagination && (
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(parseInt(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div> */}

      {/* Table */}
      <div className="overflow-x-auto">
        <TableUI ref={tableRef} {...props}>
          <TableHeader>
            <TableRow>
              {visibleColumnsList.map((column, index) => (
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

                  {/* Resize handle */}
                  {resizable && (
                    <div
                      className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize bg-gray-200 hover:bg-black transition-colors ${
                        resizingColumn === column.key
                          ? "bg-black"
                          : "bg-transparent"
                      }`}
                      onMouseDown={(e) => handleResizeStart(e, column.key)}
                      style={{ zIndex: 10 }}
                    >
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-0.5 h-8 bg-gray-400 rounded opacity-0 hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={row.id || rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                  }
                >
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
              ))
            ) : (
              <TableRow>
                {visibleColumnsList.length > 0 ? (
                  <TableCell
                    colSpan={visibleColumnsList.length}
                    className="text-center text-gray-400"
                  >
                    Sin datos
                  </TableCell>
                ) : null}
              </TableRow>
            )}
          </TableBody>
        </TableUI>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";

export default function Table({
  columns = [],
  data = [],
  onRowClick,
  searchable = true,
  filterable = true,
  pagination = true,
  itemsPerPageOptions = [10, 25, 50, 100],
  defaultItemsPerPage = 10,
  customizable = true,
  className = "",
}) {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );
  const [columnWidths, setColumnWidths] = useState(
    columns.reduce(
      (acc, col) => ({ ...acc, [col.key]: col.width || "auto" }),
      {}
    )
  );

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        filtered = filtered.filter((row) => {
          const cellValue = row[key];
          if (typeof cellValue === "string") {
            return cellValue.toLowerCase().includes(value.toLowerCase());
          }
          return String(cellValue) === String(value);
        });
      }
    });

    return filtered;
  }, [data, searchTerm, filters]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage, pagination]);

  // Get unique values for filter options
  const getFilterOptions = (columnKey) => {
    const values = [...new Set(data.map((row) => row[columnKey]))];
    return values.filter((value) => value !== null && value !== undefined);
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

  // Get visible columns
  const visibleColumnsList = columns.filter((col) => visibleColumns[col.key]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilters({});
    setCurrentPage(1);
  };

  if (!data.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay datos disponibles.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            )}

            {/* Filters */}
            {filterable && (
              <div className="flex gap-2 flex-wrap">
                {columns.map((column) => {
                  const options = getFilterOptions(column.key);
                  if (options.length <= 1) return null;

                  return (
                    <Select
                      key={column.key}
                      value={filters[column.key] || "all"}
                      onValueChange={(value) => {
                        setFilters((prev) => ({
                          ...prev,
                          [column.key]: value,
                        }));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={`Filtrar ${column.header}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {(searchTerm ||
              Object.values(filters).some((f) => f && f !== "all")) && (
              <Button variant="outline" onClick={resetFilters} size="sm">
                Limpiar filtros
              </Button>
            )}

            {customizable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Columnas
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    Mostrar/Ocultar columnas
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map((column) => (
                    <DropdownMenuItem
                      key={column.key}
                      onClick={() => toggleColumnVisibility(column.key)}
                    >
                      {visibleColumns[column.key] ? (
                        <Eye className="w-4 h-4 mr-2" />
                      ) : (
                        <EyeOff className="w-4 h-4 mr-2" />
                      )}
                      {column.header}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      {/* Results info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Mostrando {startItem}-{endItem} de {filteredData.length} resultados
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
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <TableUI>
          <TableHeader>
            <TableRow>
              {visibleColumnsList.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: columnWidths[column.key] }}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <span>{column.header}</span>
                    {customizable && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Settings className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>
                            Ancho de columna
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {[
                            "auto",
                            "100px",
                            "150px",
                            "200px",
                            "250px",
                            "300px",
                          ].map((width) => (
                            <DropdownMenuItem
                              key={width}
                              onClick={() =>
                                updateColumnWidth(column.key, width)
                              }
                            >
                              {width === "auto" ? "Automático" : width}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, rowIndex) => (
              <TableRow
                key={row.id || rowIndex}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
              >
                {visibleColumnsList.map((column) => (
                  <TableCell key={column.key}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
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

"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { getRoles, createRole, updateRole, deleteRole } from "@/services/roleService";
import Table from "@/components/tables/Table";
import { Button } from "@/components/ui/button";
import {
  Database,
  Edit3,
  Plus,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Check,
  Users
} from "lucide-react";
import useEditModeStore from "@/stores/editModeStore";
import { useLogicalTables } from "@/hooks/useLogicalTables";
import SearchBar from "@/components/common/SearchBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import GenericCRUDTable from "../common/GenericCRUDTable";
import ProtectedSection from "../common/ProtectedSection";

export default function RolesTableView({
  refresh,
  onRowClick,
  onManageCollaborators,
  showCreateButton = true,
  showActionButtons = true,
  onCreateRole
}) {
  const { isEditingMode } = useEditModeStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newTableName, setNewTableName] = useState("Roles del Sistema");
  const [nameError, setNameError] = useState("");

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState(null);
  const [localRefreshFlag, setLocalRefreshFlag] = useState(false);
  const [tableMeta, setTableMeta] = useState({ name: "Roles del Sistema" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showColumnFormDialog, setShowColumnFormDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);
  const [filterDraft, setFilterDraft] = useState({
    column: "",
    condition: "",
    value: "",
  });
  const [activeSort, setActiveSort] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  // View management state
  const [selectedView, setSelectedView] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewFormMode, setViewFormMode] = useState("create");
  const [viewToDelete, setViewToDelete] = useState(null);
  const [showViewDeleteDialog, setShowViewDeleteDialog] = useState(false);

  // Column management state
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [columnFormMode, setColumnFormMode] = useState("create");
  const [columnToDelete, setColumnToDelete] = useState(null);
  const [showColumnDeleteDialog, setShowColumnDeleteDialog] = useState(false);

  const [showManageViewsDialog, setShowManageViewsDialog] = useState(false);
  const [showEditRecordDialog, setShowEditRecordDialog] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [showManageColumnsDialog, setShowManageColumnsDialog] = useState(false);
  const [showFilterManager, setShowFilterManager] = useState(false);
  const [showColumnVisibilityDialog, setShowColumnVisibilityDialog] = useState(false);
  const [orderedViewColumnNames, setOrderedViewColumnNames] = useState([]);
  const [showSortManager, setShowSortManager] = useState(false);
  const [selectOptions, setSelectOptions] = useState({});
  const [formInitialValues, setFormInitialValues] = useState({});

  const filterConditions = [
    { value: "equals", label: "Igual a" },
    { value: "not_equals", label: "Distinto de" },
    { value: "contains", label: "Contiene" },
    { value: "not_contains", label: "No contiene" },
    { value: "greater", label: "Mayor que" },
    { value: "lower", label: "Menor que" },
    { value: "is_null", label: "Es nulo" },
    { value: "is_not_null", label: "No es nulo" },
  ];

  // Columnas definidas para roles
  const columns = [
    { name: "id", data_type: "int", column_id: 1 },
    { name: "name", data_type: "text", column_id: 2 },
    { name: "is_admin", data_type: "boolean", column_id: 3 },
  ];

  useEffect(() => {
    const initialVisibility = {};
    columns.forEach((col) => {
      initialVisibility[col.name] = true;
    });
    setColumnVisibility(initialVisibility);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rolesData = await getRoles();
        console.log("Roles data:", rolesData); // <-- valida aquí
        setRoles(rolesData || []);
        setTotal(rolesData?.length || 0);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, pageSize, refresh, localRefreshFlag])

  const handleDeleteRecord = async (record) => {
    setDeleteConfirmRecord(record);
  };

  const confirmDeleteRecord = async () => {
    if (!deleteConfirmRecord) return;

    try {
      await deleteRole(deleteConfirmRecord.id);
      setDeleteConfirmRecord(null);
      setLocalRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error deleting role:", err);
    }
  };

  const cancelDeleteRecord = () => {
    setDeleteConfirmRecord(null);
  };

  const getDefaultValuesFromFilters = (filters) => {
    const defaults = {};
    for (const filter of filters) {
      const { column, condition, value } = filter;
      const isNumeric = !isNaN(value) && value !== "";
      const numericValue = isNumeric ? Number(value) : value;

      switch (condition) {
        case "equals":
          defaults[column] = numericValue;
          break;
        default:
          break;
      }
    }
    return defaults;
  };

  const tableColumns = useMemo(() => {
    let cols = columns
      .filter((col) => columnVisibility[col.name] !== false)
      .map((col) => ({
        key: col.name,
        header: col.name === "id" ? "ID" : col.name === "name" ? "Nombre": "is_admin" ,
        width: col.data_type === "int" ? "80px" : "auto",
        render: (value, row) => {
          const cellValue = row[col.name];
          return (
            <span className="text-sm">
              {cellValue === null || cellValue === undefined
                ? "-"
                : typeof cellValue === "boolean"
                  ? cellValue ? "Sí" : "No"
                  : cellValue.toString()}
            </span>
          );
        },
      }));

    return cols;
  }, [columns, columnVisibility]);

  const tableColumnsWithActions = useMemo(() => {
    let sortedCols = [...tableColumns];

    return sortedCols.map((col) => {
      if (!isEditingMode) return col;

      return {
        ...col,
        header: (
          <div className="flex items-center justify-between group">
            <span>{col.header}</span>
          </div>
        ),
      };
    });
  }, [isEditingMode, tableColumns]);

  let processedRecords = [...roles];

  if (activeFilters.length > 0) {
    processedRecords = processedRecords.filter((row) => {
      return activeFilters.every((filter) => {
        const { column, condition, value } = filter;
        const cellValue = row[column];

        switch (condition) {
          case "equals":
            return cellValue == value;
          case "not_equals":
            return cellValue != value;
          case "contains":
            return cellValue?.toString().toLowerCase().includes(value.toLowerCase());
          case "not_contains":
            return !cellValue?.toString().toLowerCase().includes(value.toLowerCase());
          case "greater":
            return Number(cellValue) > Number(value);
          case "lower":
            return Number(cellValue) < Number(value);
          case "is_null":
            return cellValue === null || cellValue === undefined || cellValue === "";
          case "is_not_null":
            return cellValue !== null && cellValue !== undefined && cellValue !== "";
          default:
            return true;
        }
      });
    });
  }

  if (activeSort) {
    processedRecords = [...processedRecords].sort((a, b) => {
      const aVal = a[activeSort.column];
      const bVal = b[activeSort.column];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return activeSort.direction === "desc" ? -comparison : comparison;
    });
  }

  const filteredRecords = useMemo(() => {
    if (!searchTerm) {
      return processedRecords;
    }

    return processedRecords.filter((row) => {
      return columns.some((col) => {
        const cellValue = row[col.name];
        if (cellValue === null || cellValue === undefined) return false;
        return cellValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [processedRecords, searchTerm, columns]);

  const handleAddFilter = () => {
    if (
      !filterDraft.column ||
      !filterDraft.condition ||
      (filterDraft.condition !== "is_null" &&
        filterDraft.condition !== "is_not_null" &&
        filterDraft.value === "")
    ) {
      return;
    }

    setActiveFilters((prev) => [...prev, filterDraft]);
    setFilterDraft({ column: "", condition: "", value: "" });
    setShowFilterDialog(false);
  };

  const handleSetSort = () => {
    if (!sortConfig?.column || !sortConfig?.direction) {
      return;
    }

    setActiveSort({
      column: sortConfig.column,
      direction: sortConfig.direction,
    });

    setShowSortDialog(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!columns.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">
            No hay columnas definidas
          </h3>
          <p className="text-sm">Esta tabla no tiene columnas configuradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        {isEditingName ? (
          <>
            <input
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-400 focus:outline-none focus:border-black w-[300px]"
              maxLength={50}
              autoFocus
            />
            <button
              onClick={async () => {
                const trimmed = newTableName.trim();
                if (trimmed.length === 0) {
                  setNameError("El nombre no puede estar vacío");
                  return;
                }
                if (trimmed.length > 50) {
                  setNameError("El nombre no puede tener más de 50 caracteres");
                  return;
                }
                try {
                  setTableMeta(prev => ({ ...prev, name: trimmed }));
                  setIsEditingName(false);
                  setNameError("");
                } catch (error) {
                  setNameError("Error al actualizar el nombre");
                }
              }}
              className="text-gray-500 hover:text-gray-800"
              title="Guardar nombre"
            >
              <Check className="w-6 h-6" />
            </button>
          </>
        ) : (
          <>
            <span className="text-3xl font-bold text-gray-900">
              {tableMeta?.name || "Roles del Sistema"}
            </span>
            {isEditingMode && (
              <button
                onClick={() => {
                  setNewTableName(tableMeta?.name || "Roles del Sistema");
                  setIsEditingName(true);
                }}
                className="text-gray-500 hover:text-gray-800"
                title="Editar nombre"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>
      {nameError && (
        <span className="text-red-500 text-sm mt-1">{nameError}</span>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <button
              className="px-4 py-1 font-semibold text-sm border bg-black text-white shadow border-black"
            >
              Vista General
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setShowFilterManager(true)}
          >
            <Filter className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setShowSortManager(true)}
          >
            <ArrowUpDown className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setShowColumnVisibilityDialog(true)}
          >
            <Eye className="w-5 h-5" />
          </Button>

          {onManageCollaborators && (
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={onManageCollaborators}
              title="Gestionar colaboradores"
            >
              <Users className="w-5 h-5" />
            </Button>
          )}

          <div className="flex items-center gap-2">
            <SearchBar
              onSearch={setSearchTerm}
              debounceDelay={200}
              placeholder="Buscar..."
            />
          </div>

          {showCreateButton && (
            <Button
              onClick={() => {
                if (onCreateRole) {
                  onCreateRole();
                } else {
                  const defaults = getDefaultValuesFromFilters(activeFilters);
                  setFormInitialValues(defaults);
                  setShowAddRecordDialog(true);
                }
              }}
              size="lg"
              className="w-[150px] h-[36px] rounded-[5px] flex items-center justify-center"
            >
              <span
                className="w-[82px] h-[31px] flex items-center justify-center"
                style={{ fontSize: "20px" }}
              >
                Nuevo
              </span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap mb-2 items-center">
      </div>

      <div
        className="flex-1 overflow-hidden bg-white relative"
        style={{ borderRadius: 0 }}
      >
        {columns.length > 0 && (
          <div className="h-full overflow-auto">
            <GenericCRUDTable
              title={tableMeta?.name || "Roles"}
              selectedView={selectedView}
              data={filteredRecords}
              useFilter={false}
              columns={tableColumnsWithActions}
              rawColumns={columns}
              isDraggableColumnEnabled={false}
              onRowClick={onRowClick}
              getRowKey={(row) => row.id}
              onCreate={showCreateButton ? () => {
                if (onCreateRole) {
                  onCreateRole();
                } else {
                  setShowAddRecordDialog(true);
                }
              } : undefined}
              onUpdate={showActionButtons ? (id, updatedData) => {
                setRecordToEdit({ ...updatedData, id });
                setShowEditRecordDialog(true);
              } : undefined}
              onDelete={showActionButtons ? handleDeleteRecord : undefined}
              rowIdKey="id"
              permissions={{
                canCreate: showCreateButton,
                canRead: true,
                canUpdate: showActionButtons,
                canDelete: showActionButtons
              }}
              renderForm={({ mode, item, open, onClose, onSubmit }) => (
                <div></div>
              )}
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      {deleteConfirmRecord && (
        <Dialog open={true} onOpenChange={() => setDeleteConfirmRecord(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
            </DialogHeader>
            <p>¿Estás seguro de que quieres eliminar este rol?</p>
            <DialogFooter>
              <Button variant="outline" onClick={cancelDeleteRecord}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDeleteRecord}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Filter Dialog */}
      {showFilterManager && (
        <Dialog open={showFilterManager} onOpenChange={setShowFilterManager}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gestionar Filtros</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Columna</Label>
                <select
                  value={filterDraft.column}
                  onChange={(e) => setFilterDraft(prev => ({ ...prev, column: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccionar columna</option>
                  {columns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Condición</Label>
                <select
                  value={filterDraft.condition}
                  onChange={(e) => setFilterDraft(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccionar condición</option>
                  {filterConditions.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Valor</Label>
                <Input
                  value={filterDraft.value}
                  onChange={(e) => setFilterDraft(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Valor del filtro"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFilterManager(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddFilter}>
                Agregar Filtro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Sort Dialog */}
      {showSortManager && (
        <Dialog open={showSortManager} onOpenChange={setShowSortManager}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gestionar Ordenamiento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Columna</Label>
                <select
                  value={sortConfig?.column || ""}
                  onChange={(e) => setSortConfig(prev => ({ ...prev, column: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccionar columna</option>
                  {columns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Dirección</Label>
                <select
                  value={sortConfig?.direction || ""}
                  onChange={(e) => setSortConfig(prev => ({ ...prev, direction: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccionar dirección</option>
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSortManager(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSetSort}>
                Aplicar Ordenamiento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Column Visibility Dialog */}
      {showColumnVisibilityDialog && (
        <Dialog open={showColumnVisibilityDialog} onOpenChange={setShowColumnVisibilityDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Visibilidad de Columnas</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {columns.map(col => (
                <div key={col.name} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={columnVisibility[col.name] !== false}
                    onChange={(e) => setColumnVisibility(prev => ({
                      ...prev,
                      [col.name]: e.target.checked
                    }))}
                  />
                  <Label>{col.name}</Label>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowColumnVisibilityDialog(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

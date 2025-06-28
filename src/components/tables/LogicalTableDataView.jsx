import React, { useEffect, useState, useMemo } from "react";
import {
  getLogicalTableStructure,
  getLogicalTableRecords,
  updateLogicalTableRecord,
  deleteLogicalTableRecord,
} from "@/services/logicalTableService";
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
  Settings,
} from "lucide-react";
import useEditModeStore from "@/stores/editModeStore";
import DynamicRecordFormDialog from "../records/DynamicRecordFormDialog";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";
import FieldRenderer from "@/components/common/FieldRenderer";
import { notifyAssignedUser } from "@/components/notifications/notifyAssignedUser";
import { useLogicalTables } from "@/hooks/useLogicalTables";
import { useViews } from "@/hooks/useViews";
import SearchBar from "@/components/common/SearchBar";
import FilterDialog from "./dialogs/FilterDialog";
import SortDialog from "./dialogs/SortDialog";
import ColumnSettingsDialog from "./dialogs/ColumnSettingsDialog";
import ColumnForm from "../columns/ColumnForm";
import {
  createColumn,
  updateColumn,
  deleteColumn,
} from "@/services/columnsService";
import { useColumns } from "@/hooks/useColumns";
import ConfirmationDialog from "../common/ConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Trash } from "lucide-react";


import ViewForm from "@/components/ViewForm";
import GenericCRUDTable from "../common/GenericCRUDTable";

export default function LogicalTableDataView({ tableId, refresh }) {
  const { isEditingMode } = useEditModeStore();
  const { getTableById } = useLogicalTables(null);
  const {
    views,
    columns: viewColumns,
    loadingViews,
    error: viewsError,
    loadViews,
    loadColumns,
    getColumnsForView,
    handleCreateView,
    handleUpdateView,
    handleDeleteView,
    handleAddColumnToView,
    handleUpdateViewColumn,
    handleDeleteViewColumn,
  } = useViews(tableId);

  const [columns, setColumns] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState(null);
  const [localRefreshFlag, setLocalRefreshFlag] = useState(false);
  const [tableMeta, setTableMeta] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showColumnSettingsDialog, setShowColumnSettingsDialog] =
    useState(false);
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
  
  const { handleCreate } = useColumns(null);


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

  useEffect(() => {
    if (columns.length > 0) {
      const initialVisibility = {};
      columns.forEach((col) => {
        initialVisibility[col.name] = true; // Default to visible
      });
      setColumnVisibility(initialVisibility);
    }
  }, [columns]);

  useEffect(() => {
    const fetchData = async () => {
      if (!tableId) {
        setColumns([]);
        setRecords([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const cols = await getLogicalTableStructure(tableId);
        setColumns(cols);

        const data = await getLogicalTableRecords(tableId, {
          page,
          pageSize,
        });

        setRecords(data.records || data);
        setTotal(
          data.total || (data.records ? data.records.length : data.length)
        );
      } catch (err) {
        console.error("Error fetching table data:", err);
        setRecords([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableId, page, pageSize, refresh, localRefreshFlag]);

  useEffect(() => {
    const fetchMeta = async () => {
      if (!tableId) return;
      try {
        const meta = await getTableById(tableId);
        setTableMeta(meta);
      } catch (err) {
        setTableMeta(null);
      }
    };
    fetchMeta();
  }, [tableId, getTableById]);

  const handleFieldChange = (col, e) => {
    const val = e.target?.value ?? e.target?.checked ?? e;
    setEditFields((prev) => ({ ...prev, [col]: val }));
  };


  const handleDeleteRecord = async (record) => {
    setDeleteConfirmRecord(record);
  };

  const confirmDeleteRecord = async () => {
    if (!deleteConfirmRecord) return;

    try {
      await deleteLogicalTableRecord(deleteConfirmRecord.id);
      setDeleteConfirmRecord(null);
      setLocalRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  const cancelDeleteRecord = () => {
    setDeleteConfirmRecord(null);
  };

  const tableColumns = columns
    .filter((col) => columnVisibility[col.name] !== false)
    .map((col) => ({
      key: col.name,
      header: col.name,
      width: col.data_type === "int" ? "80px" : "auto",
        render: (value, row) => (
          <span className="text-sm">
            {row.record_data ? row.record_data[col.name] : row[col.name] || "-"}
          </span>
        ),
    }));

  // Add column management actions to table headers when edit mode changes
  const tableColumnsWithActions = useMemo(() => {
    return tableColumns.map((col) => {
      if (isEditingMode) {
        return {
          ...col,
          header: (
            <div className="flex items-center justify-between group">
              <span>{col.header}</span>
              <div className="flex gap-1 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleEditColumn(columns.find((c) => c.name === col.key))
                  }
                  className="h-6 w-6 p-0"
                  title="Editar columna"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ),
        };
      }
      return col;
    });
  }, [isEditingMode, tableColumns, columns]);

  let processedRecords = [...records];
  if (activeFilters.length > 0) {
    processedRecords = processedRecords.filter((row) => {
      return activeFilters.every((filter) => {
        const val = (row.record_data || row)[filter.column];
        switch (filter.condition) {
          case "equals":
            return String(val) === String(filter.value);
          case "not_equals":
            return String(val) !== String(filter.value);
          case "contains":
            return String(val || "")
              .toLowerCase()
              .includes(String(filter.value).toLowerCase());
          case "not_contains":
            return !String(val || "")
              .toLowerCase()
              .includes(String(filter.value).toLowerCase());
          case "greater":
            return Number(val) > Number(filter.value);
          case "lower":
            return Number(val) < Number(filter.value);
          case "is_null":
            return val == null || val === "";
          case "is_not_null":
            return val != null && val !== "";
          default:
            return true;
        }
      });
    });
  }
  if (activeSort && activeSort.column) {
    processedRecords = [...processedRecords].sort((a, b) => {
      const aVal = (a.record_data || a)[activeSort.column];
      const bVal = (b.record_data || b)[activeSort.column];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal === bVal) return 0;
      if (activeSort.direction === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }
  const filteredRecords = searchTerm
    ? processedRecords.filter((row) =>
        Object.values(row.record_data || row)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : processedRecords;

  const handleAddFilter = () => {
    if (
      !filterDraft.column ||
      !filterDraft.condition ||
      (filterDraft.condition !== "is_null" &&
        filterDraft.condition !== "is_not_null" &&
        filterDraft.value === "")
    )
      return;
    setActiveFilters((prev) => [...prev, filterDraft]);
    setFilterDraft({ column: "", condition: "", value: "" });
    setShowFilterDialog(false);
  };
  const handleSetSort = () => {
    if (!sortConfig?.column || !sortConfig?.direction) return;
    setActiveSort(sortConfig);
    setShowSortDialog(false);
  };
  const handleRemoveFilter = (idx) => {
    setActiveFilters((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleClearSort = () => setActiveSort(null);

  // Column management functions
  const handleCreateColumn = async (columnData) => {
    try {
      //await createColumn(columnData);
      await handleCreate({ ...columnData, table_id: tableId });
      // Refresh columns by refetching table structure
      const cols = await getLogicalTableStructure(tableId);
      setColumns(cols);
      setShowColumnFormDialog(false);
      setColumnFormMode("create");
      setSelectedColumn(null);
      setLocalRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error creating column:", err);
      throw err;
    }
  };

  const handleUpdateColumn = async (columnId, columnData) => {
    try {
      await updateColumn(columnId, columnData);
      // Refresh columns by refetching table structure
      const cols = await getLogicalTableStructure(tableId);
      setColumns(cols);
      setShowColumnFormDialog(false);
      setColumnFormMode("create");
      setSelectedColumn(null);
    } catch (err) {
      console.error("Error updating column:", err);
      throw err;
    }
  };

  const handleColumnFormSubmit = async (formData) => {
    if (columnFormMode === "create") {
      await handleCreateColumn(formData);
    } else if (columnFormMode === "edit" && selectedColumn) {
      await handleUpdateColumn(selectedColumn.id, formData);
    }
  };

  const handleColumnFormCancel = () => {
    setShowColumnFormDialog(false);
    setSelectedColumn(null);
    setColumnFormMode("create");
  };

  const handleCreateCol = () => {
    setSelectedColumn(null);
    setColumnFormMode("create");
    setShowColumnFormDialog(true);
  };

  const handleEditColumn = (column) => {
    setSelectedColumn(column);
    setColumnFormMode("edit");
    setShowColumnFormDialog(true);
  };

  const handleDeleteColumnClick = (columnId) => {
    console.log("handleDeleteColumnClick called with columnId:", columnId);
    const column = columns.find((col) => col.column_id === columnId);
    console.log("Found column:", column);
    if (column) {
      setColumnToDelete(column);
      setShowColumnDeleteDialog(true);
      console.log("Delete dialog should be opening");
    } else {
      console.log("Column not found for ID:", columnId);
    }
  };

  const handleDeleteColumn = async (column) => {
    try {
      await deleteColumn(column.column_id);
      // Refresh columns by refetching table structure
      const cols = await getLogicalTableStructure(tableId);
      setColumns(cols);
      setShowColumnDeleteDialog(false);
      setColumnToDelete(null);
    } catch (err) {
      console.error("Error deleting column:", err);
      throw err;
    }
  };

  // Row click handler for edit mode
    const handleRowClick = (row) => {
      if (isEditingMode) {
        setRecordToEdit(row);
        setShowEditRecordDialog(true);
      }
    };

  // View management functions
  const handleSelectView = async (view) => {
    if (!view) {
      // Clear view - reset to default state
      setSelectedView(null);
      setActiveSort(null);
      setActiveFilters([]);
      setColumnVisibility({});
      return;
    }

    setSelectedView(view);

    // Apply view sort configuration
    if (view.sortBy && view.sortDirection) {
      const sortCol = columns.find(col => col.column_id === view.sortBy);
      setActiveSort({
        column: sortCol?.name || null,
        direction: view.sortDirection,
    });
}

    // Load and apply view columns configuration
    try {
      await loadColumns(view.id);
      const viewCols = getColumnsForView(view.id);

      // Apply column visibility and filters from view columns
      // Filters are stored as properties of each column in the view
      const newColumnVisibility = {};
      const newFilters = [];

      viewCols.forEach((viewCol) => {
        // Find the column by ID to get the name
        const column = columns.find(
          (col) => col.column_id === viewCol.column_id
        );
        if (column) {
          // Set column visibility
          newColumnVisibility[column.name] = viewCol.visible !== false;

          // If this column has filter settings, add them to active filters
          if (
            viewCol.filter_condition &&
            (
              viewCol.filter_condition === "is_null" ||
              viewCol.filter_condition === "is_not_null" ||
              viewCol.filter_value !== null && viewCol.filter_value !== undefined && viewCol.filter_value !== ""
            )
          ) {
            newFilters.push({
              column: column.name,
              condition: viewCol.filter_condition,
              value: viewCol.filter_value,
            });
          }
        }
      });

      setColumnVisibility(newColumnVisibility);
      setActiveFilters(newFilters);
    } catch (err) {
      console.error("Error loading view configuration:", err);
    }
  };

  const handleCreateViewLocal = async (viewData) => {
    try {
      const sortColumn = columns.find(col => col.name === activeSort?.column)
      // First, create the view with basic info (name, sort settings)
      const newView = await handleCreateView({
        ...viewData,
        tableId,
        sort_by: sortColumn?.column_id || null,
        sort_direction: activeSort?.direction || null,
      });

      // Then, add each column to the view with its configuration
      // This includes visibility and filter settings for each column
      const viewColumns = columns.map((col) => {
        // Find if this column has an active filter
        const activeFilter = activeFilters.find((f) => f.column === col.name);

        return {
          view_id: newView.message.view_id,
          column_id: col.column_id,
          visible: columnVisibility[col.name] !== false,
          filter_condition: activeFilter?.condition || null,
          filter_value: activeFilter?.value || null,
        };
      });

      // Add each column configuration to the view
      // This is where filters are actually stored - as column properties
      for (const viewCol of viewColumns) {
        await handleAddColumnToView(viewCol);
      }

      setShowViewDialog(false);
      setViewFormMode("create");
      setSelectedView(null);
    } catch (err) {
      console.error("Error creating view:", err);
      throw err;
    }
  };

  const handleUpdateViewLocal = async (viewId, viewData) => {
    try {

      const sortColumn = columns.find(col => col.name === activeSort?.column);
      // First, update the view with basic info (name, sort settings)
      await handleUpdateView(viewId, {
        ...viewData,
        sortBy: sortColumn?.column_id || null,
        sortDirection: activeSort?.direction || null,
      });

      // Get current view columns to delete them
      const currentViewColumns = getColumnsForView(viewId);

      // Remove all existing column configurations from the view
      for (const viewCol of currentViewColumns) {
        await handleDeleteViewColumn(viewCol.id, viewId);
      }

      // Create new column configurations with current settings
      // This includes visibility and filter settings for each column
      const viewColumns = columns.map((col) => {
        // Find if this column has an active filter
        const activeFilter = activeFilters.find((f) => f.column === col.name);

        return {
          view_id: viewId,
          column_id: col.column_id,
          visible: columnVisibility[col.name] !== false,
          filter_condition: activeFilter?.condition || null,
          filter_value: activeFilter?.value || null,
        };
      });

      // Add each column configuration to the view
      // This is where filters are actually stored - as column properties
      for (const viewCol of viewColumns) {
        await handleAddColumnToView(viewCol);
      }

      setShowViewDialog(false);
      setViewFormMode("create");
      setSelectedView(null);
    } catch (err) {
      console.error("Error updating view:", err);
      throw err;
    }
  };


  const handleCancelEdit = () => {
  setShowEditRecordDialog(false);
  setRecordToEdit(null);
  };


  const handleDeleteViewLocal = async (view) => {
    try {
      await handleDeleteView(view.id);
      if (selectedView?.id === view.id) {
        setSelectedView(null);
        setActiveSort(null);
        setActiveFilters([]);
        setColumnVisibility({});
      }
      setShowViewDeleteDialog(false);
      setViewToDelete(null);
    } catch (err) {
      console.error("Error deleting view:", err);
      throw err;
    }
  };

  if (!tableId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Selecciona una tabla</h3>
          <p className="text-sm">
            Elige una tabla lógica del panel izquierdo para ver sus datos
          </p>
        </div>
      </div>
    );
  }

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
      <span className="text-3xl font-bold text-gray-900 mb-2">
        {tableMeta?.name || "Nombre Tabla"}
      </span>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            {/* Default view (no filters/sort) */}
            <button
              className={`px-4 py-1 font-semibold text-sm border ${
                !selectedView
                  ? "bg-black text-white shadow border-black"
                  : "bg-gray-200 text-gray-800 border-gray-300"
              }`}
              onClick={() => handleSelectView(null)}
            >
              Vista General
            </button>

            {isEditingMode && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowManageViewsDialog(true)}
                title="Editar vistas"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}

            {/* Dynamic view tabs */}
              {views.map((view) => (
                <div key={view.id} className="relative">
                  <button
                    className={`px-4 py-1 font-semibold text-sm border ${
                      selectedView?.id === view.id
                        ? "bg-black text-white shadow border-black"
                        : "bg-gray-200 text-gray-800 border-gray-300"
                    }`}
                    onClick={() => handleSelectView(view)}
                  >
                    {view.name}
                  </button>
                </div>
              ))}

            {/* Add new view button */}
            <button
              className="px-4 py-1 bg-gray-200 text-gray-800 font-semibold text-sm border border-gray-300 hover:bg-gray-300"
              onClick={() => {
                setViewFormMode("create");
                setSelectedView(null);
                setShowViewDialog(true);
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setShowFilterDialog(true)}
          >
            <Filter className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setShowSortDialog(true)}
          >
            <ArrowUpDown className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setShowColumnSettingsDialog(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={handleCreateCol}
            title="Agregar columna"
          >
            <Edit3 className="w-5 h-5" />
          </Button>
          <div className="mx-2" style={{ minWidth: 200, maxWidth: 320 }}>
            <SearchBar
              onSearch={setSearchTerm}
              placeholder="Buscar en la tabla..."
              debounceDelay={200}
            />
          </div>
          <Button
            onClick={() => setShowAddRecordDialog(true)}
            className="ml-2"
            size="lg"
          >
            Nuevo
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap mb-2 items-center">
        {activeSort && activeSort.column && (
          <span className="inline-flex items-center text-sm font-medium">
            {columns.find((c) => c.name === activeSort.column)?.name ||
              activeSort.column}
            {activeSort.direction === "asc" ? (
              <ArrowUp className="ml-1 w-4 h-4 inline" />
            ) : (
              <ArrowDown className="ml-1 w-4 h-4 inline" />
            )}
          </span>
        )}
        {activeSort && activeSort.column && activeFilters.length > 0 && (
          <div className="w-px h-4 bg-black mx-2" />
        )}
        {activeFilters.map((f, idx) => (
          <span
            key={idx}
            className="inline-flex items-center text-sm font-medium mr-4"
          >
            {columns.find((c) => c.name === f.column)?.name || f.column}{" "}
            {filterConditions.find((cond) => cond.value === f.condition)
              ?.label || f.condition}{" "}
            {f.value &&
            f.condition !== "is_null" &&
            f.condition !== "is_not_null"
              ? `"${f.value}"`
              : ""}
          </span>
        ))}
        <div className="flex-1" />
        {((activeSort && activeSort.column) ||
          (activeFilters && activeFilters.length > 0)) && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="ml-2"
              onClick={() => {
                setActiveFilters([]);
                setActiveSort(null);
              }}
            >
              Limpiar
            </Button>
            <Button
              size="sm"
              className="ml-2 bg-black text-white hover:bg-gray-900"
              onClick={() => {
                setViewFormMode("create");
                setSelectedView(null);
                setShowViewDialog(true);
              }}
            >
              Guardar
            </Button>
          </>
        )}
      </div>
      <div
        className="flex-1 overflow-hidden bg-white relative"
        style={{ borderRadius: 0 }}
      >

        {columns.length > 0 && (
          <div className="h-full overflow-auto">
            <Table
              columns={tableColumnsWithActions}
              data={filteredRecords}
              pagination={true}
              itemsPerPageOptions={[10, 25, 50]}
              defaultItemsPerPage={10}
              customizable={true}
              resizable={true}
              onRowClick={handleRowClick}
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        columns={columns}
        filterConditions={filterConditions}
        filterDraft={filterDraft}
        setFilterDraft={setFilterDraft}
        onAddFilter={handleAddFilter}
      />

      <SortDialog
        open={showSortDialog}
        onOpenChange={setShowSortDialog}
        columns={columns}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        onSetSort={handleSetSort}
      />

      <ColumnSettingsDialog
        open={showColumnSettingsDialog}
        onOpenChange={setShowColumnSettingsDialog}
        columns={columns}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />

      <DynamicRecordFormDialog
        open={showAddRecordDialog}
        onOpenChange={setShowAddRecordDialog}
        tableId={tableId}
        onSubmitSuccess={async (createdRecord) => {
          const userColumn = columns.find((col) => col.data_type === "user");
          const userId = userColumn
            ? createdRecord.message.record.record_data?.[userColumn.name]
            : null;
          if (userId) {
            try {
              const table = await getTableById(tableId);
              const tableName = table.name;

              await notifyAssignedUser({
                userId,
                action: "created",
                tableName,
                recordId: createdRecord?.id,
              });
            } catch (err) {
              console.error("Error notificando usuario asignado:", err);
            }
          }

          setShowAddRecordDialog(false);
          setLocalRefreshFlag((prev) => !prev);
        }}
      />

      <DynamicRecordFormDialog
          open={showEditRecordDialog}
          onOpenChange={(open) => {
            if (!open) handleCancelEdit();
          }}
          onCancel={handleCancelEdit}
          tableId={tableId}
          record={recordToEdit}
          mode="edit"
          onSubmitSuccess={() => {
            setShowEditRecordDialog(false);
            setRecordToEdit(null);
            setLocalRefreshFlag(prev => !prev);
          }}
        />

      <DeleteConfirmationModal
        open={!!deleteConfirmRecord}
        onOpenChange={() => setDeleteConfirmRecord(null)}
        title="¿Eliminar registro?"
        message="Esta acción no se puede deshacer. Se eliminará permanentemente el registro."
        onConfirm={confirmDeleteRecord}
        onCancel={cancelDeleteRecord}
      />

      <ColumnForm
        open={showColumnFormDialog}
        onOpenChange={setShowColumnFormDialog}
        mode={columnFormMode}
        initialData={selectedColumn}
        onSubmit={handleColumnFormSubmit}
        onCancel={handleColumnFormCancel}
        onDelete={handleDeleteColumnClick}
        loading={false}
        error={null}
        tableId={tableId}
        lastPosition={columns.length}
      />

      <ConfirmationDialog
        open={showColumnDeleteDialog}
        onClose={() => {
          setShowColumnDeleteDialog(false);
          setColumnToDelete(null);
        }}
        title={`¿Desea eliminar la columna "${columnToDelete?.name || ""}"?`}
        message={"Algunos cambios podrían ser irreparables."}
        actions={[
          {
            label: "Cancelar",
            onClick: () => {
              setShowColumnDeleteDialog(false);
              setColumnToDelete(null);
            },
            variant: "default",
          },
          {
            label: "Eliminar",
            onClick: () => handleDeleteColumn(columnToDelete),
            variant: "outline",
          },
        ]}
      />

      {/* View Form Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {viewFormMode === "create" ? "Nueva Vista" : "Editar Vista"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Nombre de la Vista</Label>
            <Input
              type="text"
              placeholder="Ingrese el nombre de la vista"
              defaultValue={selectedView?.name || ""}
              id="view-name-input"
            />
            <div className="text-sm text-gray-600">
              <p>Esta vista guardará:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {activeSort?.column && (
                  <li>
                    Ordenamiento: {activeSort.column} ({activeSort.direction})
                  </li>
                )}
                {activeFilters.length > 0 && (
                  <li>{activeFilters.length} filtro(s) aplicado(s)</li>
                )}
                <li>Configuración de columnas visibles</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewDialog(false);
                  setSelectedView(null);
                  setViewFormMode("create");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  const nameInput = document.getElementById("view-name-input");
                  const viewName = nameInput?.value?.trim();

                  if (!viewName) {
                    alert("Por favor ingrese un nombre para la vista");
                    return;
                  }

                  if (viewFormMode === "create") {
                    handleCreateViewLocal({ name: viewName });
                  } else {
                    handleUpdateViewLocal(selectedView.id, { name: viewName });
                  }
                }}
              >
                {viewFormMode === "create" ? "Crear" : "Actualizar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Delete Confirmation Dialog */}
      <Dialog open={showManageViewsDialog} onOpenChange={setShowManageViewsDialog}>
          <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Vistas</DialogTitle>
              </DialogHeader>
            <GenericCRUDTable
              title="Vistas Personalizadas"
              data={views}
              columns={[
                { key: "name", header: "Nombre", render: (val) => <span>{val}</span> },
                { key: "sort_by", header: "Orden", render: (val) => columns.find(c => c.column_id === val)?.name || "-" },
              ]}
              getRowKey={(view) => view.id}
              onCreate={handleCreateViewLocal}
              onUpdate={handleUpdateViewLocal}
              onDelete={handleDeleteViewLocal}
              renderForm={({ mode, item, open, onClose, onSubmit }) => (
                <ViewForm
                  open={open}
                  mode={mode}
                  initialData={item}
                  activeSort={activeSort}
                  activeFilters={activeFilters}
                  onClose={onClose}
                  onSubmit={onSubmit}
                />
              )}
            />
          </DialogContent>
        </Dialog>
    </div>
  );
}

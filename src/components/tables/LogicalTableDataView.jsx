import React, { useEffect, useState, useMemo } from "react";
import {
  getLogicalTableStructure,
  getLogicalTableRecords,
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
  Eye,
  Users
} from "lucide-react";
import useEditModeStore from "@/stores/editModeStore";
import DynamicRecordFormDialog from "../records/DynamicRecordFormDialog";
import { notifyAssignedUser } from "@/components/notifications/notifyAssignedUser";
import { useLogicalTables } from "@/hooks/useLogicalTables";
import { useViews } from "@/hooks/useViews";
import SearchBar from "@/components/common/SearchBar";
import FilterDialog from "./dialogs/FilterDialog";
import SortDialog from "./dialogs/SortDialog";
import ColumnForm from "../columns/ColumnForm";
import {
  updateColumn,
} from "@/services/columnsService";
import { useColumns } from "@/hooks/useColumns";
import ConfirmationDialog from "../common/ConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

import ViewForm from "@/components/ViewForm";
import GenericCRUDTable from "../common/GenericCRUDTable";
import { FileTableCell } from "../common/FileDisplay";
import useUserPermissions from "@/hooks/useUserPermissions";
import ProtectedSection from "../common/ProtectedSection";
import AssignedUsersCell from "./AssignedUsersCell";
import { hasAssignedUsersInTable, getAssignedUsersStatsForTable } from "@/services/recordAssignedUsersService";

export default function LogicalTableDataView({ tableId, refresh, colName, constFilter, hiddenColumns }) {
  const { isEditingMode } = useEditModeStore();
  const { getTableById, handleUpdatePositionRecord } = useLogicalTables(null);
  const {
    views,
    columns: viewColumns,
    error: viewsError,
    loadViews,
    loadColumns,
    getColumnsForView,
    handleCreateView,
    handleUpdateView,
    handleDeleteView,
    handleAddColumnToView,
    handleDeleteViewColumn,
  } = useViews(tableId);

  // Hook para verificar permisos del usuario
  const { permissions, loading: permissionsLoading, canCreate, canRead, canUpdate, canDelete } = useUserPermissions(tableId);

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

  // Assigned users state
  const [hasAssignedUsers, setHasAssignedUsers] = useState(false);
  const [assignedUsersStats, setAssignedUsersStats] = useState(null);

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
  
  const { handleCreate, handleUpdatePosition, handleDelete } = useColumns(null);

  constFilter = constFilter || null;

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

  useEffect(() => {
  if (!selectedView && views.length > 0 && columns.length > 0) {
    handleSelectView(views[0]);
  }
  }, [views, columns, selectedView]);

  // Verificar si hay usuarios asignados en la tabla
  useEffect(() => {
    const checkAssignedUsers = async () => {
      if (!tableId) return;
      
      try {
        console.log('Checking assigned users for table:', tableId);
        const hasUsers = await hasAssignedUsersInTable(tableId);
        console.log('hasUsers result:', hasUsers);
        setHasAssignedUsers(hasUsers);
        
        if (hasUsers) {
          const stats = await getAssignedUsersStatsForTable(tableId);
          console.log('stats result:', stats);
          setAssignedUsersStats(stats);
        } else {
          setAssignedUsersStats(null);
        }
      } catch (error) {
        console.error('Error checking assigned users:', error);
        setHasAssignedUsers(false);
      }
    };

    checkAssignedUsers();
  }, [tableId, localRefreshFlag]);

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

  const tableColumns = useMemo(() => {
    let cols = columns
      .filter((col) => columnVisibility[col.name] !== false &&
      !(hiddenColumns || []).includes(col.name))
      .map((col) => ({
        key: col.name,
        header: col.name,
        width: col.data_type === "int" ? "80px" : "auto",
          render: (value, row) => {
            const cellValue = row.record_data ? row.record_data[col.name] : row[col.name];
            
            // Renderizar archivos de manera especial
            if (col.data_type === "file" || col.data_type === "file_array") {
              return (
                <FileTableCell 
                  value={cellValue} 
                  multiple={col.data_type === "file_array"} 
                />
              );
            }
            
            // Renderizar usuarios asignados
            if (col.data_type === "assigned_users") {
              return (
                <AssignedUsersCell
                  value={cellValue}
                  onChange={() => {
                    // El componente AssignedUsersCell maneja la actualización directamente
                    // Solo triggeamos un refresh para actualizar la UI
                    setLocalRefreshFlag(prev => !prev);
                  }}
                  tableId={tableId}
                  recordId={row.id}
                  isEditing={isEditingMode}
                  className="assigned-users-cell"
                />
              );
            }
            
            // Renderizar otros tipos de datos
            return (
              <span className="text-sm">
                {cellValue || "-"}
              </span>
            );
          },
      }));

    // Agregar columna de usuarios asignados si hay usuarios asignados en la tabla
    if (hasAssignedUsers && !cols.some(col => col.key === 'assigned_users')) {
      console.log('Adding assigned users column, hasAssignedUsers:', hasAssignedUsers);
      cols.push({
        key: 'assigned_users',
        header: 'Usuarios Asignados',
        width: '200px',
        render: (value, row) => {
          return (
            <AssignedUsersCell
              value={[]} // Se cargarán desde el backend
              onChange={() => {
                // Trigger refresh para actualizar la UI
                setLocalRefreshFlag(prev => !prev);
              }}
              tableId={tableId}
              recordId={row.id}
              isEditing={isEditingMode}
              className="assigned-users-cell"
            />
          );
        },
      });
    } else {
      console.log('Not adding assigned users column:', {
        hasAssignedUsers,
        hasAssignedUsersColumn: cols.some(col => col.key === 'assigned_users')
      });
    }

    console.log('Final columns:', cols.map(c => c.key));
    return cols;
  }, [columns, columnVisibility, hiddenColumns, hasAssignedUsers, tableId, isEditingMode]);

  // Add column management actions to table headers when edit mode changes
  const tableColumnsWithActions = useMemo(() => {
    return tableColumns.map((col) => {
      if (isEditingMode) {
        return {
          ...col,
          header: (
            <div className="flex items-center justify-between group">
              <span>{col.header}</span>
            </div>
          ),
        };
      }
      return col;
    });
  }, [isEditingMode, tableColumns, columns]);

  

  let processedRecords = [...records];

  if (constFilter) {
    processedRecords = processedRecords.filter((row) => {
      const val = (row.record_data || row)[constFilter.column];
      switch (constFilter.condition) {
        case "equals":
          return String(val) === String(constFilter.value);
        case "not_equals":
          return String(val) !== String(constFilter.value);
        case "contains":
          return String(val || "").toLowerCase().includes(String(constFilter.value).toLowerCase());
        case "not_contains":
          return !String(val || "").toLowerCase().includes(String(constFilter.value).toLowerCase());
        case "greater":
          return Number(val) > Number(constFilter.value);
        case "lower":
          return Number(val) < Number(constFilter.value);
        case "is_null":
          return val == null || val === "";
        case "is_not_null":
          return val != null && val !== "";
        default:
          return true;
      }
    });
  }
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
      setLocalRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error updating column:", err);
      throw err;
    }
  };

  const handleColumnFormSubmit = async (formData) => {
    if (columnFormMode === "create") {
      await handleCreateColumn(formData);
    } else if (columnFormMode === "edit" && selectedColumn) {
      await handleUpdateColumn(selectedColumn.column_id, formData);
    }
  };

  const handleColumnFormCancel = () => {
    setShowColumnFormDialog(false);
    setSelectedColumn(null);
    setColumnFormMode("create");
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
    console.log("mana: intenta borrar");
    try {
      await handleDelete(column.column_id);
      // Refresh columns by refetching table structure
      const cols = await getLogicalTableStructure(tableId);
      setColumns(cols);
      setShowColumnDeleteDialog(false);
      setColumnToDelete(null);
    } catch (err) {
      console.log("mana: falla borrar");
      console.error("Error deleting column:", err);
      throw err;
    }
  };

  // View management functions
  const handleSelectView = async (view) => {
    if (!view) {
      console.log("mana: no hay view")
      // Clear view - reset to default state
      setSelectedView(null);
      setActiveSort(null);
      setActiveFilters([]);
      setColumnVisibility({});
      return;
    }
    console.log("mana: si hay view")
    setSelectedView(view);

    // Apply view sort configuration
    if (view.sortBy && view.sortDirection) {
      console.log("mana: si tiene reglas")
      const sortCol = columns.find(col => col.column_id === view.sortBy);
      setActiveSort({
        column: sortCol?.name || null,
        direction: view.sortDirection,
      });
    }

    // Load and apply view columns configuration
    try {
        const viewCols = await loadColumns(view.id); // <-- usamos el resultado directamente

        const newColumnVisibility = {};
        const newFilters = [];

        viewCols.forEach((viewCol) => {
          const column = columns.find(
            (col) => col.column_id === viewCol.column_id
          );
          if (column) {
            newColumnVisibility[column.name] = viewCol.visible !== false;

            if (
              viewCol.filter_condition &&
              (
                viewCol.filter_condition === "is_null" ||
                viewCol.filter_condition === "is_not_null" ||
                (viewCol.filter_value !== null &&
                  viewCol.filter_value !== undefined &&
                  viewCol.filter_value !== "")
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
            {views.length === 0 && (
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

            )}

            {/* Dynamic view tabs */}
            {views.map((view) => (
              <div key={view.id} className="relative">
                <button
                  className={`text-sm font-bold rounded transition-colors border-[3px]
                    ${
                      selectedView?.id === view.id
                        ? "bg-black/30 text-black border-black"
                        : "bg-transparent text-black border-black"
                    }`}
                  style={{
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                  }}
                  onClick={() => handleSelectView(view)}
                >
                  {view.name}
                </button>
              </div>
            ))}

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
            onClick={() => setShowSortDialog(true)}
          >
            <ArrowUpDown className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <SearchBar
              onSearch={setSearchTerm}
              debounceDelay={200}
              placeholder="Buscar..."
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setShowFilterDialog(true)}
          >
            <Eye className="w-5 h-5" />
          </Button>
          
         
          {canCreate && (
            <Button
              onClick={() => setShowAddRecordDialog(true)}
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
        
      </div>
      <div
        className="flex-1 overflow-hidden bg-white relative"
        style={{ borderRadius: 0 }}
      >
          {isEditingMode && (
          <div className="absolute top-0 right-0 mt-1 mr-2 z-10">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowManageColumnsDialog(true)}
              title="Gestionar columnas"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
           )}

        {columns.length > 0 && (
        <div className="h-full overflow-auto">
          <GenericCRUDTable
            title={tableMeta?.name || "Tabla"}
            data={filteredRecords}
            useFilter = {false}
            columns={tableColumnsWithActions}
            onOrderChange={async (reorderedRecords) => {
                try {
                  for (let i = 0; i < reorderedRecords.length; i++) {
                    await handleUpdatePositionRecord(reorderedRecords[i].id, i + 1);
                  }
                  setLocalRefreshFlag((prev) => !prev); // Refresca una sola vez al final
                } catch (err) {
                  console.error("Error al reordenar registros:", err);
                }
              }}
            getRowKey={(row) => row.id}
            onCreate={canCreate ? () => setShowAddRecordDialog(true) : undefined}
            onUpdate={canUpdate ? (id, updatedData) => {
              setRecordToEdit({ ...updatedData, id });
              setShowEditRecordDialog(true);
            } : undefined}
            onDelete={canDelete ? handleDeleteRecord : undefined}
            rowIdKey="id"
            permissions={{
              canCreate,
              canRead,
              canUpdate,
              canDelete
            }}
              renderForm={({ mode, item, open, onClose, onSubmit }) => (
                  <DynamicRecordFormDialog
                    open={open}
                    colName={colName}
                    foreignForm={!!(constFilter && hiddenColumns)}
                    onOpenChange={(val) => {
                      if (!val) onClose();
                    }}
                    onCancel={onClose}
                    tableId={tableId}
                    record={item}
                    mode={mode}
                    onDelete={canDelete ? handleDeleteRecord : undefined}
                    onSubmitSuccess={async (createdOrUpdatedRecord) => {
                      if (mode === "create") {
                        const userColumn = columns.find((col) => col.data_type === "user");
                        const userId = userColumn
                          ? createdOrUpdatedRecord.message.record.record_data?.[userColumn.name]
                          : null;

                        if (userId) {
                          try {
                            const table = await getTableById(tableId);
                            const tableName = table.name;

                            await notifyAssignedUser({
                              userId,
                              action: "created",
                              tableName,
                              recordId: createdOrUpdatedRecord?.id,
                            });
                          } catch (err) {
                            console.error("Error notificando usuario asignado:", err);
                          }
                        }
                      }

                      onSubmit(createdOrUpdatedRecord);
                      setLocalRefreshFlag((prev) => !prev);
                    }}
                  />
                )}
          />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        columns={columns}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
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

      <DynamicRecordFormDialog
        open={showAddRecordDialog}
        onOpenChange={setShowAddRecordDialog}
        tableId={tableId}
        colName={colName}
        foreignForm={!!(constFilter && hiddenColumns)}
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


      <ConfirmationDialog
        open={!!deleteConfirmRecord}
        onClose={() => setDeleteConfirmRecord(null)}
        title="¿Eliminar registro?"
        message="Esta acción no se puede deshacer. Se eliminará permanentemente el registro."
        actions={[
          {
            label: "Cancelar",
            onClick: cancelDeleteRecord,
            variant: "default",
          },
          {
            label: "Eliminar",
            onClick: confirmDeleteRecord,
            variant: "outline",
          },
        ]}
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
        open={showViewDeleteDialog}
        onClose={() => {
          setShowViewDeleteDialog(false);
          setViewToDelete(null);
        }}
        title={`¿Desea eliminar la vista "${viewToDelete?.name || ""}"?`}
        message={"Esta acción no se puede deshacer."}
        actions={[
          {
            label: "Cancelar",
            onClick: () => {
              setShowViewDeleteDialog(false);
              setViewToDelete(null);
            },
            variant: "default",
          },
          {
            label: "Eliminar",
            onClick: () => handleDeleteViewLocal(viewToDelete),
            variant: "outline",
          },
        ]}
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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

      <Dialog open={showManageColumnsDialog} onOpenChange={setShowManageColumnsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto"> 
          <DialogHeader>
            <DialogTitle>Columnas</DialogTitle>
          </DialogHeader>

            <GenericCRUDTable
              title="Columnas"
              data={columns}
              hiddenColumns = {hiddenColumns}
              columns={[
                { column_id: "name", name: "name",  key: "name", header: "Nombre"},
                { column_id: "data_type", name: "data_type",  key: "data_type", header: "Tipo"},
                {
                  column_id: "required",
                  name: "required",
                  key: "required",
                  header: "Requerido",
                  render: (val) => (val ? "Sí" : "No"),
                },
              ]}
              onOrderChange={async (reorderedCols) => {
                try {
                  for (let i = 0; i < reorderedCols.length; i++) {
                    await handleUpdatePosition(reorderedCols[i].column_id, i + 1);
                  }
                  setLocalRefreshFlag((prev) => !prev); // Refresca una sola vez al final
                } catch (err) {
                  console.error("Error al reordenar columnas:", err);
                }
              }}
              getRowKey={(col) => col.column_id}
              onCreate={handleCreateColumn}
              onUpdate={handleUpdateColumn}
              rowIdKey={"column_id"}
              onDelete={handleDeleteColumn}
              renderForm={({ mode, item, open, onClose, onSubmit }) => (
                <ColumnForm
                  open={open}
                  onOpenChange={(val) => {
                    if (!val) onClose();
                  }}
                  mode={mode}
                  initialData={item}
                  onSubmit={onSubmit}
                  onCancel={onClose}
                  onDelete={(colId) => {
                    handleDeleteColumnClick(colId);
                    onClose();
                  }}
                  loading={false}
                  error={null}
                  tableId={tableId}
                  lastPosition={columns.length}
                />
              )}
            />

          {/*           <div className="overflow-x-auto border-t border-gray-200 mt-4 pt-4">
            <ColumnManager tableId={tableId} tableName="x" />
          </div>*/}

        </DialogContent>
      </Dialog>
      {/* View Delete Confirmation Dialog */}
      <Dialog open={showManageViewsDialog} onOpenChange={setShowManageViewsDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Vistas</DialogTitle>
              </DialogHeader>
            <GenericCRUDTable
              title="Vistas Personalizadas"
              data={views}
              columns={[
                {
                  key: "name",
                  column_id: "name",
                  header: "Nombre",
                  name: "name",
                  render: (val) => <span>{val}</span>,
                },
                {
                  key: "sort_by",
                  column_id: "sort_by",
                  header: "Orden",
                  name: "sort_by",
                  render: (val) =>
                    columns.find((c) => c.column_id === val)?.name || "-",
                },
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
                  onDelete={(viewId) => {
                    setViewToDelete(views.find((v) => v.id === viewId));
                    setShowViewDeleteDialog(true);
                    onClose();
                  }}
                />
              )}
            />

        <DialogFooter className="flex justify-end gap-2 pt-4">
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
              </>
            )}

        </DialogFooter>

          </DialogContent>
        </Dialog>

        <Dialog open={showFilterManager} onOpenChange={setShowFilterManager}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filtros aplicados</DialogTitle>
            </DialogHeader>

            <GenericCRUDTable
              title="Filtros"
              data={activeFilters}
              columns={[
                {
                  key: "column",
                  column_id: "column",
                  header: "Columna",
                  name: "column",
                  render: (val) => columns.find((c) => c.name === val)?.name || val,
                },
                {
                  key: "condition",
                  column_id: "condition",
                  header: "Condición",
                  name: "condition",
                  render: (val) =>
                    filterConditions.find((cond) => cond.value === val)?.label || val,
                },
                {
                  key: "value",
                  column_id: "value",
                  header: "Valor",
                  name: "value",
                },
              ]}
              getRowKey={(_, i) => i} // índice como ID
              rowIdKey={"column"} // solo para evitar warning
              onCreate={(newFilter) =>
                setActiveFilters((prev) => [...prev, newFilter])
              }
              onUpdate={(i, updatedFilter) => {
                setActiveFilters((prev) =>
                  prev.map((f, index) => (index === i ? updatedFilter : f))
                );
              }}
              onDelete={(_, idx) => {
                setActiveFilters((prev) => prev.filter((_, i) => i !== idx));
              }}
              renderForm={({ mode, item, open, onClose, onSubmit }) => {
                const [formData, setFormData] = useState(item || {
                  column: columns[0]?.name,
                  condition: "equals",
                  value: "",
                });

                return (
                  <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {mode === "create" ? "Nuevo Filtro" : "Editar Filtro"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Label>Columna</Label>
                        <select
                          value={formData.column}
                          onChange={(e) =>
                            setFormData({ ...formData, column: e.target.value })
                          }
                          className="w-full border px-2 py-1"
                        >
                          {columns.map((col) => (
                            <option key={col.name} value={col.name}>
                              {col.name}
                            </option>
                          ))}
                        </select>

                        <Label>Condición</Label>
                        <select
                          value={formData.condition}
                          onChange={(e) =>
                            setFormData({ ...formData, condition: e.target.value })
                          }
                          className="w-full border px-2 py-1"
                        >
                          {filterConditions.map((cond) => (
                            <option key={cond.value} value={cond.value}>
                              {cond.label}
                            </option>
                          ))}
                        </select>

                        {!["is_null", "is_not_null"].includes(formData.condition) && (
                          <>
                            <Label>Valor</Label>
                            <Input
                              value={formData.value}
                              onChange={(e) =>
                                setFormData({ ...formData, value: e.target.value })
                              }
                            />
                          </>
                        )}
                      </div>
                      <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={onClose}>
                          Cancelar
                        </Button>
                        <Button onClick={() => onSubmit(formData)}>
                          {mode === "create" ? "Agregar" : "Actualizar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                );
              }}
            />
          </DialogContent>
        </Dialog>

    </div>
  );
}

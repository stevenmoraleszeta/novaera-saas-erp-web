import React, { useEffect, useState, useMemo } from "react";
import {
  getLogicalTableStructure,
  getLogicalTableRecords,
  updateLogicalTableRecord,
  deleteLogicalTableRecord,
} from "@/services/logicalTableService";
import Table from "@/components/tables/Table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Edit3,
  Save,
  X,
  Trash2,
  Search,
  Plus,
  Minus,
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
import ConfirmationDialog from "../common/ConfirmationDialog";

export default function LogicalTableDataView({ tableId, refresh }) {
  const { isEditingMode } = useEditModeStore();
  const { getTableById } = useLogicalTables(null);

  const [columns, setColumns] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
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

  // Column management state
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [columnFormMode, setColumnFormMode] = useState("create");
  const [columnToDelete, setColumnToDelete] = useState(null);
  const [showColumnDeleteDialog, setShowColumnDeleteDialog] = useState(false);

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
    if (editingRecordId) {
      const rec = records.find((r) => r.id === editingRecordId);
      setEditFields(rec ? { ...rec.record_data } : {});
      setSaveError(null);
    } else {
      setEditFields({});
      setSaveError(null);
    }
  }, [editingRecordId, records]);

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

  const handleSave = async (record) => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateLogicalTableRecord(record.id, {
        table_id: tableId,
        record_data: editFields,
      });
      setEditingRecordId(null);
      setLocalRefreshFlag((prev) => !prev);
    } catch (err) {
      setSaveError("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleEditRecord = (record) => {
    setEditingRecordId(record.id);
  };

  const handleCancelEdit = () => {
    setEditingRecordId(null);
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
      render: (value, row) => {
        const isEditing = isEditingMode && editingRecordId === row.id;

        if (isEditing) {
          return (
            <FieldRenderer
              id={`edit-${row.id}-${col.name}`}
              column={col}
              value={editFields[col.name]}
              onChange={(e) => handleFieldChange(col.name, e)}
            />
          );
        }

        return (
          <span className="text-sm">
            {row.record_data ? row.record_data[col.name] : row[col.name] || "-"}
          </span>
        );
      },
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
      await createColumn(columnData);
      // Refresh columns by refetching table structure
      const cols = await getLogicalTableStructure(tableId);
      setColumns(cols);
      setShowColumnFormDialog(false);
      setColumnFormMode("create");
      setSelectedColumn(null);
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
      handleEditRecord(row);
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
            <button className="px-4 py-1 bg-black text-white font-semibold text-sm shadow border border-black">
              Vista 1
            </button>
            <button className="px-4 py-1 bg-gray-200 text-gray-800 font-semibold text-sm border border-gray-300">
              Vista 2
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
                const saveObject = {
                  tableId,
                  sortBy: activeSort?.column || null,
                  sortOrder: activeSort?.direction || null,
                  filters: activeFilters.map((filter) => ({
                    columnId: filter.column,
                    visibility: columnVisibility[filter.column] !== false,
                    filterCondition: filter.condition,
                    filterValue: filter.value,
                  })),
                };
                console.log("Guardar object:", saveObject);
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
        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

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
    </div>
  );
}

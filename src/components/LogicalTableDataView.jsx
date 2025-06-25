import React, { useEffect, useState } from "react";
import {
  getLogicalTableStructure,
  getLogicalTableRecords,
  updateLogicalTableRecord,
} from "@/services/logicalTableService";
import Table from "@/components/Table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import useEditModeStore from "@/stores/editModeStore";

const CONDITIONS = [
  { value: "equals", label: "Igual a" },
  { value: "notEquals", label: "Distinto de" },
  { value: "contains", label: "Contiene" },
  { value: "isNull", label: "Es nulo" },
];

export default function LogicalTableDataView({
  tableId,
  refresh,
  onDeleteRecord,
  onRecordSaved,
}) {
  const { isEditingMode } = useEditModeStore();

  const [columns, setColumns] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState([
    { column: "", condition: "equals", value: "" },
  ]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

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
  }, [tableId, page, pageSize, refresh]);

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

  // Multi-filter logic
  const handleFilterChange = (idx, field, value) => {
    setFilters((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f))
    );
  };
  const handleAddFilter = () => {
    setFilters((prev) => [
      ...prev,
      { column: "", condition: "equals", value: "" },
    ]);
  };
  const handleRemoveFilter = (idx) => {
    setFilters((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleApplyFilters = () => {
    setAppliedFilters(filters.filter((f) => f.column && f.value));
  };
  const handleClearFilters = () => {
    setFilters([{ column: "", condition: "equals", value: "" }]);
    setAppliedFilters([]);
  };

  // Filtering records client-side (could be server-side if needed)
  const filteredRecords =
    appliedFilters.length === 0
      ? records
      : records.filter((rec) => {
          return appliedFilters.every((f) => {
            const col = f.column;
            const val =
              (rec.record_data ? rec.record_data[col] : rec[col]) || "";
            if (f.condition === "equals") return String(val) === f.value;
            if (f.condition === "notEquals") return String(val) !== f.value;
            if (f.condition === "contains")
              return String(val).toLowerCase().includes(f.value.toLowerCase());
            if (f.condition === "isNull")
              return val === null || val === "" || typeof val === "undefined";
            return true;
          });
        });

  const handleFieldChange = (col, value) => {
    setEditFields((prev) => ({ ...prev, [col]: value }));
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
      if (onRecordSaved) onRecordSaved();
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
    if (onDeleteRecord) {
      onDeleteRecord(record);
    }
  };

  // Transform columns for the Table component
  const tableColumns = columns.map((col) => ({
    key: col.name,
    header: col.name,
    width: col.data_type === "int" ? "80px" : "auto",
    render: (value, row) => {
      const isEditing = isEditingMode && editingRecordId === row.id;

      if (isEditing) {
        return (
          <Input
            value={editFields[col.name] || ""}
            onChange={(e) => handleFieldChange(col.name, e.target.value)}
            className="h-8 text-sm"
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

  // Add actions column if in editing mode
  if (isEditingMode) {
    tableColumns.push({
      key: "actions",
      header: "Acciones",
      width: "120px",
      render: (value, row) => {
        const isEditing = editingRecordId === row.id;

        if (isEditing) {
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => handleSave(row)}
                disabled={saving}
                className="h-7 px-2 bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={saving}
                className="h-7 px-2"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          );
        }

        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditRecord(row)}
              className="h-7 px-2"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteRecord(row)}
              className="h-7 px-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        );
      },
    });
  }

  if (!tableId) {
    return (
      <div className="flex-1 flex items-center justify-center">
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
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!columns.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
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
    <div className="flex-1 p-6 overflow-hidden">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Database className="w-5 h-5" />
              Datos de la tabla
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {records.length} registros
              </Badge>
              {isEditingMode && (
                <Badge
                  variant="secondary"
                  className="bg-green-600 text-white text-xs"
                >
                  Modo edición
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          {/* Multi-filter bar */}
          <div className="mb-4">
            {filters.map((f, idx) => {
              const isNull = f.condition === "isNull";
              return (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition"
                    value={f.column}
                    onChange={(e) =>
                      handleFilterChange(idx, "column", e.target.value)
                    }
                  >
                    <option value="">Columna</option>
                    {columns.map((col) => (
                      <option key={col.name} value={col.name}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition"
                    value={f.condition}
                    onChange={(e) =>
                      handleFilterChange(idx, "condition", e.target.value)
                    }
                  >
                    {CONDITIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    className="h-8 text-sm w-48 disabled:bg-gray-100 disabled:text-gray-400"
                    value={isNull ? "" : f.value}
                    onChange={(e) =>
                      handleFilterChange(idx, "value", e.target.value)
                    }
                    placeholder="Valor"
                    disabled={isNull}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:bg-gray-100"
                    onClick={() => handleRemoveFilter(idx)}
                    disabled={filters.length === 1}
                    title="Eliminar filtro"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddFilter}
              >
                <Plus className="w-4 h-4 mr-1" /> Añadir filtro
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-black text-white hover:bg-gray-900"
                onClick={handleApplyFilters}
              >
                <Search className="w-4 h-4" />
              </Button>
              {appliedFilters.length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleClearFilters}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>

          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{saveError}</p>
            </div>
          )}

          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h4 className="font-medium mb-2">No hay datos</h4>
              <p className="text-sm">Esta tabla no tiene registros</p>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <Table
                columns={tableColumns}
                data={filteredRecords}
                searchable={false}
                filterable={false}
                pagination={true}
                itemsPerPageOptions={[10, 25, 50]}
                defaultItemsPerPage={10}
                customizable={true}
                resizable={true}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

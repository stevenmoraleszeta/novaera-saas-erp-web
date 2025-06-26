import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import useEditModeStore from "@/stores/editModeStore";
import DynamicRecordFormDialog from "../records/DynamicRecordFormDialog";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";
import FieldRenderer from "@/components/common/FieldRenderer";
import { notifyAssignedUser } from "@/components/notifications/notifyAssignedUser";
import { useLogicalTables } from "@/hooks/useLogicalTables";

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

  const tableColumns = columns.map((col) => ({
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
                data={records}
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

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              onClick={() => setShowAddRecordDialog(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Nuevo Registro
            </Button>
          </div>

          <DynamicRecordFormDialog
            open={showAddRecordDialog}
            onOpenChange={setShowAddRecordDialog}
            tableId={tableId}
            onSubmitSuccess={async (createdRecord) => {
              const userColumn = columns.find(col => col.data_type === "user");
              const userId = userColumn ? createdRecord.message.record.record_data?.[userColumn.name] : null;
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
        </CardContent>
      </Card>
    </div>
  );
}

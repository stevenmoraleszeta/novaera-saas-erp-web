// app/modules/[id]/page.jsx (o .tsx si usas TypeScript)

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loader from "@/components/common/Loader";
import StatusBadge from "@/components/modules/ModuleStatusBadge";
import { useModules } from "@/hooks/useModules";
import Table from "@/components/tables/Table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogicalTables } from "@/hooks/useLogicalTables";
import LogicalTablesSidebar from "@/components/tables/LogicalTablesSidebar";
import LogicalTableDetails from "@/components/tables/LogicalTableDetails";
import LogicalTableModal from "@/components/tables/LogicalTableModal";
import { Package } from "lucide-react";
import useEditModeStore from "@/stores/editModeStore";
import UserLinkDialog from "@/components/users/UserLinkDialog";
import { useColumns } from "@/hooks/useColumns";
import useUserStore from "@/stores/userStore";
import LogicalTableDataView from "@/components/tables/LogicalTableDataView";

export default function ModuleDetailPage() {
  const { modules, getById } = useModules();

  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Logical tables state
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [refreshData, setRefreshData] = useState(0);
  const [shouldRefreshTables, setShouldRefreshTables] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const { getAllTables, getTableById, createOrUpdateTable, deleteTable } =
    useLogicalTables(id);

  const { isEditingMode } = useEditModeStore();
  const { user } = useUserStore();

  const [showUserLinkDialog, setShowUserLinkDialog] = useState(false);
  const [createdTableId, setCreatedTableId] = useState(null);

  const { handleCreate } = useColumns(createdTableId);

  // Dynamic columns based on module type or data structure
  const getColumns = (data) => {
    if (!data || data.length === 0) return [];

    const firstItem = data[0];
    return Object.keys(firstItem).map((key) => ({
      key,
      header:
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
      width: key === "id" ? "80px" : "auto",
    }));
  };

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const moduleData = await getById(id);
        setModule(moduleData);

        // Fetch module-specific data if available
        if (moduleData && moduleData.data) {
          setModuleData(moduleData.data);
        } else {
          // Fallback to sample data if no real data available
          setModuleData([
            {
              id: 1,
              name: "Monitor",
              quantity: 15,
              location: "Almacén A",
              status: "Activo",
            },
            {
              id: 2,
              name: "Teclado",
              quantity: 30,
              location: "Almacén B",
              status: "Activo",
            },
            {
              id: 3,
              name: "Mouse",
              quantity: 25,
              location: "Almacén A",
              status: "Inactivo",
            },
            {
              id: 4,
              name: "Impresora",
              quantity: 8,
              location: "Almacén C",
              status: "Activo",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching module:", error);
        // Set fallback data on error
        setModuleData([
          {
            id: 1,
            name: "Error al cargar datos",
            quantity: 0,
            location: "N/A",
            status: "Error",
          },
        ]);
      } finally {
        setLoading(false);
        setDataLoading(false);
      }
    };

    fetchModule();
  }, [id, getById]);

  // Fetch logical tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setTablesLoading(true);
        const data = await getAllTables();
        setTables(data);
      } catch (err) {
        console.error("Error al obtener tablas lógicas:", err);
      } finally {
        setTablesLoading(false);
      }
    };
    if (id) fetchTables();
  }, [id, getAllTables]);

  // Form validation
  const validateTable = (values) => {
    const errors = {};
    if (!values.name) errors.name = "El nombre es requerido";
    if (!values.id && tables.some((t) => t.name === values.name))
      errors.name = "El nombre ya existe";
    return errors;
  };

  // Handle table form submission
  const handleSubmitTable = async (values) => {
    setFormLoading(true);
    setFormError(null);
    try {
      let data;
      if (!values.id) {
        // CREATE
        data = await createOrUpdateTable({
          name: values.name,
          description: values.description,
          module_id: Number(id),
        });
      } else {
        // UPDATE
        data = await createOrUpdateTable({
          id: values.id,
          name: values.name,
          description: values.description,
        });
      }

      // Close the modal
      setShowTableModal(false);

      // Refresh tables to get the updated data
      setShouldRefreshTables(true);

      // If it's a create operation and we got the new table data, select it
      if (!values.id && data) {
        setCreatedTableId(data); // guardar el id para usar en la creación de la columna
        setShowUserLinkDialog(true); // mostrar el diálogo
        setSelectedTable(data);
      }
      // For updates, keep the current selection but refresh the data
    } catch (err) {
      setFormError(err?.response?.data?.message || "Error al guardar");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle table deletion
  const handleDeleteTable = async (table) => {
    try {
      await deleteTable(table.id);
      setTables((prev) => prev.filter((t) => t.id !== table.id));
      if (selectedTable?.id === table.id) setSelectedTable(null);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "No se pudo eliminar la tabla. Puede tener dependencias."
      );
    }
  };

  // Action handlers
  const handleAddTable = () => {
    setSelectedTable(null);
    setShowTableModal(true);
  };

  const handleEditTable = (table) => {
    setSelectedTable(table);
    setShowTableModal(true);
  };

  const handleViewTable = (table) => {
    setSelectedTable(table);
  };

  // Refresh tables after modal closes and shouldRefreshTables is true
  useEffect(() => {
    if (!showTableModal && shouldRefreshTables) {
      (async () => {
        setTablesLoading(true);
        try {
          const refreshed = await getAllTables();
          setTables(refreshed);

          // If we had a selected table, make sure it stays selected with updated data
          if (selectedTable) {
            const updatedSelectedTable = refreshed.find(
              (t) => t.id === selectedTable.id
            );
            if (updatedSelectedTable) {
              setSelectedTable(updatedSelectedTable);
            }
          }
        } catch (err) {
          // handle error if needed
        } finally {
          setTablesLoading(false);
          setShouldRefreshTables(false);
        }
      })();
    }
  }, [showTableModal, shouldRefreshTables, getAllTables, selectedTable]);

  const handleRecordSaved = () => {
    // Refresh data after record is saved
    setRefreshData((prev) => prev + 1);
  };

  const handleTableRefresh = () => {
    // Refresh table data view when columns change
    setRefreshData((prev) => prev + 1);
  };

  const handleUserLinkConfirm = async (newColumnData) => {
    if (!createdTableId) return;
    await handleCreate({ ...newColumnData, table_id: createdTableId });
    setShowUserLinkDialog(false);
    setCreatedTableId(null);
    setRefreshData((prev) => prev + 1); // para que refresque los datos
  };

  if (loading) return <Loader text="Cargando módulo..." />;
  if (!module) return <p>No se encontró el módulo con ID {id}.</p>;

  const columns = getColumns(moduleData);

  return (
    <div>
      {/* Main Content: Only first logical table's data view */}
      <div className="flex-1 overflow-hidden">
        {tablesLoading ? (
          <Loader text="Cargando tablas..." />
        ) : tables.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8 text-gray-500">
            No hay tablas lógicas para este módulo.
          </div>
        ) : (
          <LogicalTableDataView tableId={tables[tables.length - 1].id} refresh={refreshData} />
        )}
      </div>

      {/* Table Modal */}
      <LogicalTableModal
        open={showTableModal}
        onOpenChange={(open) => setShowTableModal(open)}
        mode={selectedTable ? "edit" : "create"}
        initialData={selectedTable}
        onSubmit={handleSubmitTable}
        onCancel={() => setShowTableModal(false)}
        validate={validateTable}
        loading={formLoading}
        error={formError}
      />

      <UserLinkDialog
        open={showUserLinkDialog}
        onConfirm={handleUserLinkConfirm}
        onCancel={() => setShowUserLinkDialog(false)}
        createdBy={user?.id}
      />
    </div>
  );
}

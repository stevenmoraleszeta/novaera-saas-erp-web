// app/modules/[id]/page.jsx (o .tsx si usas TypeScript)

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loader from "@/components/Loader";
import StatusBadge from "@/components/ModuleStatusBadge";
import { useModules } from "@/hooks/useModules";
import Table from "@/components/Table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogicalTables } from "@/hooks/useLogicalTables";
import LogicalTablesSidebar from "@/components/LogicalTablesSidebar";
import LogicalTableDetails from "@/components/LogicalTableDetails";
import LogicalTableModal from "@/components/LogicalTableModal";
import { Package } from "lucide-react";

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

  // Inline editing state
  const [editFields, setEditFields] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const { getAllTables, getTableById, createOrUpdateTable, deleteTable } =
    useLogicalTables(id);

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

  // Update edit fields when selected table changes
  useEffect(() => {
    if (selectedTable) {
      setEditFields({
        name: selectedTable.name,
        alias: selectedTable.alias || "",
        description: selectedTable.description || "",
      });
      setIsDirty(false);
      setSaveError(null);
    }
  }, [selectedTable]);

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
      setTables((prev) => {
        const idx = prev.findIndex((t) => t.id === data.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = data;
          return updated;
        }
        return [...prev, data];
      });
      setShowTableModal(false);
      setSelectedTable(data);
      // Refresh tables list
      try {
        const refreshed = await getAllTables();
        setTables(refreshed);
      } catch (refreshErr) {
        // If refresh fails, at least the new table remains in the list
      }
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

  // Inline editing handler
  const handleFieldChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Save inline changes
  const handleSaveChanges = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = {
        id: selectedTable.id,
        name: editFields.name ?? selectedTable.name,
        description: editFields.description ?? selectedTable.description,
      };
      const data = await createOrUpdateTable(updated);
      setTables((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      setSelectedTable(data);
      setIsDirty(false);
      try {
        const refreshed = await getAllTables();
        setTables(refreshed);
      } catch (refreshErr) {}
    } catch (err) {
      setSaveError("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Cargando módulo..." />;
  if (!module) return <p>No se encontró el módulo con ID {id}.</p>;

  const columns = getColumns(moduleData);

  return (
    <div>
      {/* Header Section */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{module.name}</h1>
            <p className="text-gray-600 text-sm">
              {module.description || "Sin descripción"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {module.category || "Sin categoría"}
            </Badge>
            <StatusBadge status={module.status} />
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex h-[calc(100vh-200px)] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Logical Tables Sidebar */}
        <LogicalTablesSidebar
          tables={tables}
          selectedTable={selectedTable}
          onTableSelect={handleViewTable}
          onTableEdit={handleEditTable}
          onTableDelete={handleDeleteTable}
          onAddTable={handleAddTable}
          loading={tablesLoading}
        />

        {/* Table Details */}
        <LogicalTableDetails
          table={selectedTable}
          editFields={editFields}
          isDirty={isDirty}
          saving={saving}
          saveError={saveError}
          onFieldChange={handleFieldChange}
          onSaveChanges={handleSaveChanges}
          onDeleteTable={handleDeleteTable}
        />
      </div>

      {/* Module Data Table */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Datos del módulo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <Loader text="Cargando datos del módulo..." />
            ) : (
              <Table
                columns={columns}
                data={moduleData}
                searchable={true}
                filterable={true}
                pagination={true}
                itemsPerPageOptions={[10, 25, 50]}
                defaultItemsPerPage={10}
                customizable={true}
              />
            )}
          </CardContent>
        </Card>
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
    </div>
  );
}

// app/modules/[id]/page.jsx (o .tsx si usas TypeScript)

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getModuleById } from "@/services/moduleService";
import Loader from "@/components/Loader";
import StatusBadge from "@/components/ModuleStatusBadge";
import { useModules } from "@/hooks/useModules";
import Table from "@/components/Table";
import MainContent from "@/components/MainContent";
import { Badge } from "@/components/ui/badge";

export default function ModuleDetailPage() {
  const { modules, getById } = useModules();

  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

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

  if (loading) return <Loader text="Cargando módulo..." />;
  if (!module) return <p>No se encontró el módulo con ID {id}.</p>;

  const columns = getColumns(moduleData);

  return (
    <div className="max-w-full mx-auto">
      {/* Header Section - Outside the card */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{module.name}</h1>
          <Badge variant="secondary" className="text-sm">
            {module.category || "Sin categoría"}
          </Badge>
        </div>
        <p className="text-gray-600 text-lg">
          {module.description || "Sin descripción"}
        </p>
        <div className="mt-3">
          <StatusBadge status={module.status} />
        </div>
      </div>

      {/* Table Section - Inside card */}
      <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
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
      </div>
    </div>
  );
}

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

  const columns = [
    { key: "name", header: "Nombre" },
    { key: "quantity", header: "Cantidad" },
    { key: "location", header: "Ubicación" },
  ];

  const data = [
    { id: 1, name: "Monitor", quantity: 15, location: "Almacén A" },
    { id: 2, name: "Teclado", quantity: 30, location: "Almacén B" },
    { id: 3, name: "Mouse", quantity: 25, location: "Almacén A" },
    { id: 4, name: "Impresora", quantity: 8, location: "Almacén C" },
  ];

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const data = await getById(id);
        setModule(data);
      } catch (error) {
        console.error("Error fetching module:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [id]);

  if (loading) return <Loader text="Cargando módulo..." />;
  if (!module) return <p>No se encontró el módulo con ID {id}.</p>;

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
        <Table columns={columns} data={data} />
      </div>
    </div>
  );
}

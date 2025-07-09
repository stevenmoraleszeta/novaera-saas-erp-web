import React from "react";
import { useRouter } from "next/navigation";
import useTabStore from "@/stores/tabStore";
import { useEditMode } from "@/hooks/useEditMode";
import ModuleCard from "./ModuleCard";
import AddModuleCard from "./AddModuleCard";
import Loader from "@/components/common/Loader";
import Pagination from "@/components/common/Pagination";

export default function ModuleList({
  modules = [],
  loading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
  onAdd,
}) {
  const router = useRouter();
  const { addModuleTab } = useTabStore();
  const { isEditingMode, isHydrated } = useEditMode();

  // Debug: Log del modo edición en ModuleList
  console.log("🔧 ModuleList - Modo edición:", isEditingMode, "Hidratado:", isHydrated);

  const handleModuleClick = (module) => {
    if (isEditingMode) {
      onEdit(module);
    } else {
      // Add tab for module and navigate
      addModuleTab(module.id, module.name);
      router.push(`/modulos/${module.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader text="Cargando módulos..." />
      </div>
    );
  }

  if (!loading && !modules.length) {
    return (
      <div className="text-center text-gray-500">
        {isEditingMode ? (
          <div className="max-w-6xl w-full">
            <div className="flex flex-wrap gap-[clamp(16px,2.5vw,32px)] justify-start">
              <div className="flex flex-col items-center gap-[clamp(12px,1.5vw,20px)] w-[clamp(160px,20vw,240px)]">
                <div className="w-full">
                  <AddModuleCard
                    onClick={onAdd}
                    isEditingMode={isEditingMode}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-8">No se encontraron módulos.</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full p-8">
      <div className="flex flex-wrap gap-[clamp(16px,2.5vw,32px)] justify-start">
        {modules.map((module) => (
          <div
            key={module.id}
            className="flex flex-col items-center gap-[clamp(12px,1.5vw,20px)] w-[clamp(160px,20vw,240px)]"
          >
            <div className="w-full">
              <ModuleCard
                module={module}
                onClick={handleModuleClick}
                isEditingMode={isEditingMode}
              />
            </div>
            <span className="font-bold text-[clamp(16px,2.5vw,24px)] text-gray-700 dark:text-gray-300 text-center leading-tight px-1 w-full truncate">
              {module.name}
            </span>
          </div>
        ))}

        {isEditingMode && (
          <div className="flex flex-col items-center gap-[clamp(12px,1.5vw,20px)] w-[clamp(160px,20vw,240px)]">
            <div className="w-full">
              <AddModuleCard onClick={onAdd} isEditingMode={isEditingMode} />
            </div>
            <span className="text-transparent invisible *:font-bold text-[clamp(16px,2.5vw,24px)] dark:text-gray-300 text-center leading-tight px-1 w-full truncate">
              Agregar Módulo
            </span>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}

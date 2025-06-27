import React from "react";
import { useRouter } from "next/navigation";
import useTabStore from "@/stores/tabStore";
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
  isEditingMode = true,
}) {
  const router = useRouter();
  const { addModuleTab } = useTabStore();

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

  if (!modules.length) {
    return (
      <div className="text-center text-gray-500">
        {isEditingMode ? (
          <div className="flex justify-center">
            <div className="max-w-6xl w-full">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(clamp(160px,20vw,240px),1fr))] gap-[clamp(16px,1.5vw,32px)]">
                <div className="flex flex-col items-center justify-center gap-[clamp(12px,1.5vw,20px)] h-[40vh]">
                  <div className="w-full max-w-[clamp(100px,15vw,200px)]">
                    <AddModuleCard
                      onClick={onAdd}
                      isEditingMode={isEditingMode}
                    />
                  </div>
                  <span className="font-bold text-[clamp(16px,2.5vw,24px)] text-gray-700 dark:text-gray-300 text-center leading-tight break-words px-1">
                    Agregar Módulo
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <p className="mt-8">No se encontraron módulos.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(clamp(160px,20vw,240px),1fr))] gap-[clamp(16px,1.5vw,32px)]">
          {modules.map((module) => (
            <div
              key={module.id}
              className="flex flex-col items-center justify-center gap-[clamp(12px,1.5vw,20px)] h-[40vh]"
            >
              <div className="w-full max-w-[clamp(100px,15vw,200px)]">
                <ModuleCard
                  module={module}
                  onClick={handleModuleClick}
                  isEditingMode={isEditingMode}
                />
              </div>
              <span className="font-bold text-[clamp(16px,2.5vw,24px)] text-gray-700 dark:text-gray-300 text-center leading-tight break-words px-1">
                {module.name}
              </span>
            </div>
          ))}

          {isEditingMode && (
            <div className="flex flex-col items-center justify-center gap-[clamp(12px,1.5vw,20px)] h-[40vh]">
              <div className="w-full max-w-[clamp(100px,15vw,200px)]">
                <AddModuleCard onClick={onAdd} isEditingMode={isEditingMode} />
              </div>
              <span className="font-bold text-[clamp(16px,2.5vw,24px)] text-gray-700 dark:text-gray-300 text-center leading-tight break-words px-1">
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
    </div>
  );
}

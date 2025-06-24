import React from "react";
import { useRouter } from "next/navigation";
import useTabStore from "@/stores/tabStore";
import ModuleCard from "./ModuleCard";
import AddModuleCard from "./AddModuleCard";
import Loader from "./Loader";
import Pagination from "./Pagination";

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
      <div className="text-center py-8 text-gray-500">
        <p>No se encontraron módulos.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">
          {modules.map((module) => (
            <div key={module.id} className="flex flex-col items-center gap-3">
              <ModuleCard
                module={module}
                onClick={handleModuleClick}
                isEditingMode={isEditingMode}
              />
              <span className="font-bold text-2xl text-gray-700 dark:text-gray-300 text-center">
                {module.name}
              </span>
            </div>
          ))}

          {isEditingMode && (
            <AddModuleCard onClick={onAdd} isEditingMode={isEditingMode} />
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

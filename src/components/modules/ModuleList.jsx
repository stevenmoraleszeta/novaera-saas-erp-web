import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useTabStore from "@/stores/tabStore";
import { useEditMode } from "@/hooks/useEditMode";
import ModuleCard from "./ModuleCard";
import AddModuleCard from "./AddModuleCard";
import Loader from "@/components/common/Loader";
import Pagination from "@/components/common/Pagination";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { useModules } from "@/hooks/useModules";

import SortableModuleCard from "./SortableModuleCard"; // lo crearemos abajo

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

  const {
    handleUpdatePosition,
  } = useModules();


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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
      // Desactiva el sensor si no está en modo edición
      disabled: !isEditingMode,
    })
  );

  const [items, setItems] = useState(modules.map(m => m.id));

  // Si modules cambia (por paginación), resync
  useEffect(() => {
    setItems(modules.map(m => m.id));
  }, [modules]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(active.id);
    const newIndex = items.indexOf(over.id);

    const newOrder = arrayMove(items, oldIndex, newIndex);
    setItems(newOrder);

    handleColumnReorder(newOrder);

    // opcional: puedes guardar orden en backend aquí
    // saveModuleOrder(newOrder)
  };

  const handleColumnReorder = async (reorderedModules) => {

    try {
      for (let i = 0; i < reorderedModules.length; i++) {
        await handleUpdatePosition(reorderedModules[i], i + 1);
      }
      // Puedes agregar un refresh o callback si es necesario aquí
    } catch (err) {
      console.error("Error al reordenar modulos:", err);
    }
  };


  const renderModuleCards = () => (
    <>
      {items.map((id) => {
        const module = modules.find((m) => m.id === id);
        if (!module) return null;

        return (
          <div
            key={module.id}
            className="flex flex-col items-center gap-[clamp(12px,1.5vw,20px)] w-[clamp(160px,20vw,240px)]"
          >
            <div className="w-full">
              {isEditingMode ? (
                <SortableModuleCard
                  module={module}
                  onClick={handleModuleClick}
                  isEditingMode={isEditingMode}
                />
              ) : (
                <ModuleCard
                  module={module}
                  onClick={handleModuleClick}
                  isEditingMode={isEditingMode}
                />
              )}
            </div>
            <span className="font-bold text-[clamp(16px,2.5vw,24px)] text-gray-700 dark:text-gray-300 text-center leading-tight px-1 w-full truncate">
              {module.name}
            </span>
          </div>
        );
      })}

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
    </>
  );

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
      {isEditingMode ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-[clamp(16px,2.5vw,32px)] justify-start">
              {renderModuleCards()}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-wrap gap-[clamp(16px,2.5vw,32px)] justify-start">
          {renderModuleCards()}
        </div>
      )}
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

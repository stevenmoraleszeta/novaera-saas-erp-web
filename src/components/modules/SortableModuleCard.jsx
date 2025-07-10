import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ModuleCard from "./ModuleCard";

export default function SortableModuleCard({ module, onClick, isEditingMode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "manipulation",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ModuleCard module={module} onClick={onClick} isEditingMode={isEditingMode} />
    </div>
  );
}

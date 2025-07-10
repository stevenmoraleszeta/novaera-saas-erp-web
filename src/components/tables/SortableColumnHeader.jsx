import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableHead } from "@/components/ui/table";
import { useRef } from "react";
import useEditModeStore from "@/stores/editModeStore";

export default function SortableColumnHeader({
  column,
  columnWidths,
  resizingColumn,
  handleResizeStart,
}) {
  const { isEditingMode } = useEditModeStore(); // 🟢 esto controla si se puede mover
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: column.key,
    data: { type: "column" },
    disabled: !isEditingMode, // 🟢 ahora se habilita solo cuando isEditingMode está activo
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: columnWidths[column.key],
    minWidth: "100px",
    position: "relative",
  };

  return (
    <TableHead
      ref={setNodeRef}
      {...(isEditingMode ? attributes : {})}
      {...(isEditingMode ? listeners : {})}
      style={style}
      className={`cursor-pointer select-none ${isEditingMode ? "cursor-grab hover:bg-[#f0f0f0]" : "cursor-default"}`}

    >
      <div className="flex items-center justify-between pr-2">
        <span className="truncate">{column.header}</span>
      </div>

      <div
        className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize ${
          resizingColumn === column.key
            ? "bg-black"
            : "bg-transparent hover:bg-gray-300"
        }`}
        onMouseDown={(e) => handleResizeStart(e, column.key)}
        style={{ zIndex: 10 }}
      >
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-0.5 h-8 bg-gray-400 rounded opacity-0 hover:opacity-100 transition-opacity" />
      </div>
    </TableHead>
  );
}

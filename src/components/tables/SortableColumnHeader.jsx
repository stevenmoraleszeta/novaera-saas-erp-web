import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableHead } from "@/components/ui/table";
import { GripVertical } from "lucide-react";
import { useRef } from "react";
import useEditModeStore from "@/stores/editModeStore";

export default function SortableColumnHeader({
  column,
  columnWidths,
  resizingColumn,
  handleResizeStart,
  isDraggingEnabled,
  setIsDraggingEnabled,
}) {
  const timeoutRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: column.key,
    data: { type: "column" },
    disabled: !isDraggingEnabled,
  });

  const { isEditingMode } = useEditModeStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: columnWidths[column.key],
    minWidth: "100px",
    position: "relative",
  };

  const handleMouseDown = () => {
    if(isEditingMode){
      timeoutRef.current = setTimeout(() => {
        setIsDraggingEnabled(true);
      }, 1000); // ⏱️ espera 1 segundo
      }

  };

  const handleMouseUp = () => {
    clearTimeout(timeoutRef.current);
  };

  return (
    <TableHead
      ref={setNodeRef}
      {...(isDraggingEnabled ? attributes : {})}
      {...(isDraggingEnabled ? listeners : {})}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`cursor-pointer hover:bg-gray-50 select-none ${
        isDraggingEnabled ? "bg-black/30" : ""
      }`}
    >
      <div className="flex items-center justify-between pr-2 cursor-grab">
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

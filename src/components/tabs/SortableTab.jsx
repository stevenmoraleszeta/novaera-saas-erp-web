import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, X , Pin} from "lucide-react";

export default function SortableTab({ tab, activeTab, onClick, onClose, icon, onTogglePin }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: tab.id,
    disabled: tab.isFixed,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(tab.id)}
      className={`flex items-center px-4 py-2 cursor-pointer border-b-2 min-w-0 flex-shrink-0 ${
        activeTab === tab.id
          ? "border-black bg-white dark:bg-gray-700"
          : "border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
      } ${tab.isFixed ? "bg-gray-100 dark:bg-gray-700" : ""}`}
    >
      <span className="mr-2 flex-shrink-0">{icon}</span>
      <span className={`text-sm truncate max-w-32 ${tab.isFixed ? "font-medium" : ""}`}>
        {tab.name}
      </span>

      {!tab.isHome && (
        <Button
          variant="ghost"
          size="icon"
          className="ml-1 w-5 h-5 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(tab.id);
          }}
        >
        <Pin
          className={`w-4 h-4 transition-opacity duration-300 ${
            tab.isFixed ? "opacity-100" : "opacity-50"
          }`}
        />
        </Button>
      )}


      {!tab.isFixed && (
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 w-5 h-5 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onClose(tab.id);
          }}
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function DraggableViewTab({ view, isSelected, isEditing, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: view.id, 
    disabled: !isEditing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="relative flex items-center"
    >
      <button
        onClick={() => onClick(view)}
        className={`text-sm font-bold rounded transition-colors border-[3px] flex-grow
          ${isSelected ? "bg-black/30 text-black border-black" : "bg-transparent text-black border-black"}`}
        style={{
          paddingTop: "5px",
          paddingBottom: "5px",
          paddingLeft: "24px",
          paddingRight: "24px",
          cursor: isEditing ? 'grab' : 'pointer', 
        }}
      >
        {view.name}
      </button>
    </div>
  );
}

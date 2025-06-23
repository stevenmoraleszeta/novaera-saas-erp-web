import React, { useState } from 'react';
import { PiPencilSimpleBold, PiPencilSimple } from 'react-icons/pi';

export default function EditToggleButton({ onToggle }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = () => {
    const newState = !isEditing;
    setIsEditing(newState);
    onToggle?.(newState); 
  };

  return (
    <button className="edit-toggle-button" onClick={handleClick}>
      {isEditing ? (
        <PiPencilSimpleBold size={24} />
      ) : (
        <PiPencilSimple size={24} />
      )}
      <style jsx>{`
        .edit-toggle-button {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: ${isEditing ? '#22c55e' : '#6b7280'};
          transition: color 0.2s;
        }

        .edit-toggle-button:hover {
          color: #16a34a;
        }
      `}</style>
    </button>
  );
}

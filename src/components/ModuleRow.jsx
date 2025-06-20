import React from 'react';
import { useRouter } from 'next/navigation';
import { PiPencilSimpleBold, PiTrashBold } from 'react-icons/pi';

export default function ModuleRow({ module, onEdit, onDelete, isEditingMode }) {
  const router = useRouter();

  const handleCardClick = () => {
    if (isEditingMode) {
      onEdit?.(module); // Abrir modal
    } else {
      router.push(`/modulos/${module.id}`); // Redirigir

    }
  };
  return (
    <div className="module-wrapper">
      <div className="module-card" onClick={handleCardClick}>
        {module.iconUrl ? (
          <img src={module.iconUrl} alt={module.name} className="module-icon" />
        ) : (
          <div className="no-icon">📦</div>
        )}

      {/*<div className="actions" onClick={(e) => e.stopPropagation()}>
          <button title="Editar" onClick={onEdit} className="btn btn-edit">
            <PiPencilSimpleBold />
          </button>
          <button title="Eliminar" onClick={onDelete} className="btn btn-delete">
            <PiTrashBold />
          </button>
        </div> */}

      </div>

      <div className="module-name" title={module.name}>
        {module.name}
      </div>

      <style jsx>{`
        .module-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 120px;
          margin: 0.5rem;
        }

        .module-card {
          width: 110px;
          height: 110px;
          background: #fff;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 4px 16px 0 rgba(0,0,0,0.10);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s;
        }

        .module-card:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 24px 0 rgba(0,0,0,0.13);
        }

        .module-icon,
        .no-icon {
          width: 56px;
          height: 56px;
          object-fit: contain;
        }

        .no-icon {
          font-size: 2.5rem;
          color: #222;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .module-name {
          font-size: 1rem;
          color: #222;
          text-align: center;
          margin-top: 0.7rem;
          font-weight: 600;
          max-width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          letter-spacing: 0.01em;
        }

        .actions {
          position: absolute;
          top: 4px;
          right: 4px;
          display: flex;
          gap: 4px;
        }

        .btn {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          padding: 2px;
          color: #6b7280;
        }

        .btn-edit:hover {
          color: #22c55e;
        }

        .btn-delete:hover {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}

import React from 'react';
import { PiPencilSimpleBold, PiTrashBold } from 'react-icons/pi';

export default function ModuleRow({ module, onEdit, onDelete }) {
  return (
    <div className="module-wrapper">
      <div className="module-card">
        {module.iconUrl ? (
          <img src={module.iconUrl} alt={module.name} className="module-icon" />
        ) : (
          <div className="no-icon">📦</div>
        )}

        {/*  
        <div className="actions">
          <button title="Editar" onClick={onEdit} className="btn btn-edit">
            <PiPencilSimpleBold />
          </button>
          <button title="Eliminar" onClick={onDelete} className="btn btn-delete">
            <PiTrashBold />
          </button>
        </div>

        */}
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
          width: 100%;
          height: 100px;
          background: #f3f4f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .module-icon,
        .no-icon {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .no-icon {
          font-size: 2rem;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .module-name {
          font-size: 0.85rem;
          color: #374151;
          text-align: center;
          margin-top: 0.3rem;
          max-width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
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

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';

function ModuleRowComponent({ module, onEdit, onDelete, isEditingMode }) {
  const router = useRouter();

  const handleCardClick = useCallback(() => {
    if (isEditingMode) {
      onEdit?.(module); // Abre modal en modo edición
    } else {
      router.push(`/modulos/${module.id}`); // Navega a detalle
    }
  }, [isEditingMode, module, onEdit, router]);

  return (
    <div className="module-wrapper">
      <div className="module-card" onClick={handleCardClick}>
        {module.iconUrl ? (
          <img src={module.iconUrl} alt={module.name} className="module-icon" />
        ) : (
          <div className="no-icon">📦</div>
        )}
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
          box-shadow: 0 4px 16px rgba(0,0,0,0.10);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s;
        }
        .module-card:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(0,0,0,0.13);
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
      `}</style>
    </div>
  );
}

export default React.memo(ModuleRowComponent);

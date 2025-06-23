import React, { useCallback } from 'react';
import ModuleRow from './ModuleRow';
import Loader from '../ui/Loader';
import Pagination from '../commmon/Pagination';

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
  isEditingMode = true
}) {
  const addModule = {
    id: '__add__',
    name: 'Agregar',
    description: '',
    iconUrl: 'https://icon2.cleanpng.com/20180610/yr/aa8tqkh1s.webp',
    createdBy: 1,
    createdAt: '2024-01-15T10:30:00Z'
  };

  // Memoiza handlers para evitar recrearlos en cada render
  const handleEdit = useCallback((mod) => () => onEdit(mod), [onEdit]);
  const handleDelete = useCallback((mod) => () => onDelete(mod), [onDelete]);

  if (loading) {
    return (
      <div className="module-list-loading">
        <Loader text="Cargando módulos..." />
      </div>
    );
  }

  return (
    <div className="module-grid-wrapper">
      {!modules.length && <p className="no-data">No se encontraron módulos.</p>}

      <div className="module-grid">
        {modules.map((module) => (
          <ModuleRow
            key={module.id}
            module={module}
            onEdit={handleEdit(module)}
            onDelete={handleDelete(module)}
            isEditingMode={isEditingMode}
          />
        ))}

        {isEditingMode && (
          <ModuleRow
            key="add"
            module={addModule}
            onEdit={onAdd}
            onDelete={() => {}}
            isEditingMode={isEditingMode}
          />
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}

      <style jsx>{`
        .module-grid-wrapper {
          padding: 1rem;
        }
        .module-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 2.2rem;
          justify-items: center;
        }
        .no-data {
          text-align: center;
          padding: 2rem 0 1rem 0;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}

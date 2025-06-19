import React from 'react';
import ModuleRow from './ModuleRow';
import Loader from './Loader';
import Pagination from './Pagination';

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
}) {
  if (loading) {
    return (
      <div className="module-list-loading">
        <Loader text="Cargando módulos..." />
      </div>
    );
  }

  if (!modules.length) {
    return <p className="no-data">No se encontraron módulos.</p>;
  }

  return (
    <div className="module-grid-wrapper">
        <div className="module-grid">
        {modules.map((module) => (
            <ModuleRow
            key={module.id}
            module={module}
            onEdit={() => onEdit(module)}
            onDelete={() => onDelete(module)}
            />
        ))}
        </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />

      <style jsx>{`
        .module-grid-wrapper {
          padding: 1rem;
        }

        .module-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
          justify-items: center;
        }

        .no-data {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}

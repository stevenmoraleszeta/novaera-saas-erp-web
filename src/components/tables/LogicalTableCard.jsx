import React from 'react';

export default function LogicalTableCard({ table, onView, onEdit, onDelete, editing }) {
  return (
    <div className="logical-table-card">
      <div>
        <h3>{table.name}</h3>
        <p><strong>Alias:</strong> {table.alias || '-'}</p>
        <p><strong>Descripción:</strong> {table.description || '-'}</p>
        <p><strong>Columnas:</strong> {table.columnsCount ?? '-'}</p>
      </div>
      {editing && (
        <div className="actions">
          <button onClick={() => onView(table)} title="Ver">👁️</button>
          <button onClick={() => onEdit(table)} title="Editar">✏️</button>
          <button onClick={() => onDelete(table)} title="Eliminar">🗑️</button>
        </div>
      )}
      <style jsx>{`
        .logical-table-card {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 1em;
          margin-bottom: 1em;
          background: #f9fafb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .actions button {
          margin-left: 0.5em;
          font-size: 1.1em;
          background: none;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

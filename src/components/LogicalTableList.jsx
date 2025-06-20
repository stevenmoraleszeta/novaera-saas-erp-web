import React from 'react';
import LogicalTableCard from './LogicalTableCard';

export default function LogicalTableList({ tables, onView, onEdit, onDelete, editing }) {
  return (
    <div>
      {tables.map(table => (
        <LogicalTableCard
          key={table.id}
          table={table}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          editing={editing}
        />
      ))}
    </div>
  );
}

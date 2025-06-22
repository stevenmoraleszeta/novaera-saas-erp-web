import React from 'react';

export default function LogicalTableList({ tables, selectedTable, onSelect, editing, onEdit, onDelete }) {
  // If editing, show cards with actions, else show simple list
  if (editing) {
    return (
      <div>
        {tables.map(table => (
          <div key={table.id} className={`logical-table-card${selectedTable && selectedTable.id === table.id ? ' selected' : ''}`} style={{ marginBottom: 8, border: selectedTable && selectedTable.id === table.id ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: selectedTable && selectedTable.id === table.id ? '#f3f4f6' : '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div onClick={() => onSelect(table)} style={{ cursor: 'pointer', flex: 1 }}>
              <span style={{ fontWeight: 500 }}>{table.name}</span>
            </div>
            
          </div>
        ))}
      </div>
    );
  }
  // Not editing: simple selectable list
  return (
    <ul className="logical-tables-list">
      {tables.map((table, idx) => (
        <li
          key={table.id ?? `table-idx-${idx}`}
          className={`logical-table-item${selectedTable && selectedTable.id === table.id ? ' selected' : ''}`}
          onClick={() => onSelect(table)}
          style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 6, background: selectedTable && selectedTable.id === table.id ? '#f3f4f6' : 'transparent', marginBottom: 4 }}
        >
          <span>{table.name}</span>
        </li>
      ))}
    </ul>
  );
}

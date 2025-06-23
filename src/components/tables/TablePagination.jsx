import React from 'react';

export default function TablePagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>&lt;</button>
      <span>Página {page} de {totalPages}</span>
      <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>&gt;</button>
      <select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))}>
        {[10, 20, 50, 100].map(size => (
          <option key={size} value={size}>{size} por página</option>
        ))}
      </select>
      <span>Total: {total}</span>
    </div>
  );
}

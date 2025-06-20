import React from 'react';

export default function Table({ columns = [], data = [], onRowClick }) {
  if (!data.length) {
    return <p className="no-data">No hay datos disponibles.</p>;
  }

  return (
    <div className="table-container">
      <table className="generic-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .table-container {
          overflow-x: auto;
          margin-top: 1rem;
        }

        .generic-table {
          width: 100%;
          border-collapse: collapse;
        }

        .generic-table th,
        .generic-table td {
          padding: 0.75rem 1rem;
          border: 1px solid #e5e7eb;
          text-align: left;
        }

        .generic-table th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }

        .clickable {
          cursor: pointer;
        }

        .clickable:hover {
          background-color: #f3f4f6;
        }

        .no-data {
          padding: 1rem;
          text-align: center;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
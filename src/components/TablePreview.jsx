import React from 'react';
import { PiArrowBendRightUpFill } from 'react-icons/pi';

export default function TablePreview({ tableName = 'MiTabla', columns = [] }) {
  return (
    <div className="table-preview">
      <div className="table-card">
        <div className="table-header">{tableName}</div>
        <div className="table-columns">
          {columns.map((col, idx) => (
            <div className="column-row" key={idx}>
              <div className="column-name">{col.name}</div>
              <div className="column-type">{col.data_type}</div>
              {col.is_required && <div className="required">*</div>}
              {col.is_foreign_key && (
                <div className="fk-icon" title={`FK → ${col.foreign_table_id}.${col.foreign_column_name}`}>
                  <PiArrowBendRightUpFill size={16}  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .table-preview {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .table-card {
          background: white;
          border: 2px solid #d1d5db;
          border-radius: 0.75rem;
          padding: 1rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .table-header {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #111827;
          text-align: center;
        }

        .table-columns {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .column-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }

        .column-name {
          flex: 2;
          font-weight: 500;
          color: #374151;
        }

        .column-type {
          flex: 1;
          font-size: 0.85rem;
          color: #6b7280;
          text-align: right;
        }

        .required {
          margin-left: 0.5rem;
          color: #dc2626;
          font-weight: bold;
        }

        .fk-icon {
          margin-left: 0.75rem;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
}

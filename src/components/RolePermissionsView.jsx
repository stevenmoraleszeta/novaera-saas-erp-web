import React from 'react';

export default function RolePermissionsView({ permissions, tables }) {
  return (
    <div className="permissions-table-container">
      <table className="permissions-table">
        <thead>
          <tr>
            <th>Tabla</th>
            <th><span className="perm-icon create">🟢</span> Crear</th>
            <th><span className="perm-icon read">🔵</span> Leer</th>
            <th><span className="perm-icon update">🟡</span> Editar</th>
            <th><span className="perm-icon delete">🔴</span> Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm) => {
            const tableName = tables?.find(t => t.id === perm.table_id)?.name || perm.table_id;
            return (
              <tr key={perm.table_id}>
                <td className="table-name">{tableName}</td>
                <td className={perm.can_create ? 'perm-yes' : 'perm-no'}>{perm.can_create ? '✔️' : '—'}</td>
                <td className={perm.can_read ? 'perm-yes' : 'perm-no'}>{perm.can_read ? '✔️' : '—'}</td>
                <td className={perm.can_update ? 'perm-yes' : 'perm-no'}>{perm.can_update ? '✔️' : '—'}</td>
                <td className={perm.can_delete ? 'perm-yes' : 'perm-no'}>{perm.can_delete ? '✔️' : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <style jsx>{`
        .permissions-table-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
        }
        .permissions-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 1em;
          background: #f9fafb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
        }
        .permissions-table th, .permissions-table td {
          padding: 0.85em 1.2em;
          text-align: center;
        }
        .permissions-table th {
          background: #e0e7ef;
          color: #22223b;
          font-weight: 600;
          font-size: 1em;
          border-bottom: 2px solid #c7d2fe;
        }
        .permissions-table tr:last-child td {
          border-bottom: none;
        }
        .table-name {
          text-align: left;
          font-weight: 500;
          color: #3b3b4f;
          background: #f1f5f9;
        }
        .perm-yes {
          background: #e0fbe0;
          color: #15803d;
          font-weight: bold;
          border-radius: 6px;
        }
        .perm-no {
          background: #f3f4f6;
          color: #a1a1aa;
          border-radius: 6px;
        }
        .perm-icon {
          font-size: 1.1em;
          vertical-align: middle;
        }
        .perm-icon.create { color: #22c55e; }
        .perm-icon.read { color: #2563eb; }
        .perm-icon.update { color: #eab308; }
        .perm-icon.delete { color: #ef4444; }
      `}</style>
    </div>
  );
}

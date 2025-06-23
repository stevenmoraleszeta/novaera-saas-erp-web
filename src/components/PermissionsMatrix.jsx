"use client";
import PermissionCheckbox from "./ui/PermissionCheckbox";

export default function PermissionsMatrix({ tables, permissions, onChange, loading }) {
  const actions = ["can_read", "can_create", "can_update", "can_delete"];
  const actionLabels = {
    can_read: "Leer",
    can_create: "Crear",
    can_update: "Actualizar",
    can_delete: "Eliminar",
  };

  return (
    <div className="permissions-matrix">
      <table>
        <thead>
          <tr>
            <th>Tabla</th>
            {actions.map(a => <th key={a}>{actionLabels[a]}</th>)}
          </tr>
        </thead>
        <tbody>
          {tables.map(table => (
            <tr key={table.id}>
              <td>{table.name}</td>
              {actions.map(action => (
                <td key={action}>
                  <PermissionCheckbox
                    checked={permissions[table.id]?.[action] || false}
                    onChange={checked =>
                      onChange(table.id, {
                        ...permissions[table.id],
                        [action]: checked,
                      })
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        .permissions-matrix {
          overflow-x: auto;
          margin-bottom: 2rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
        }
        th, td {
          padding: 0.85em 1.2em;
          border: 1px solid #e5e7eb;
          text-align: center;
          font-size: 1.08em;
          color: #232526;
        }
        th {
          background: #e9fbe5;
          color: #43a047;
          font-size: 1.13em;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        td {
          background: #fff;
        }
        tr:nth-child(even) td {
          background: #f7fafc;
        }
        td:first-child {
          font-weight: 600;
          color: #0070f3;
          text-align: left;
        }
        /* Mejorar visibilidad de los checkboxes */
        input[type="checkbox"] {
          width: 1.3em;
          height: 1.3em;
          accent-color: #7ed957;
          border-radius: 4px;
          border: 1.5px solid #bdbdbd;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          transition: box-shadow 0.18s;
        }
        input[type="checkbox"]:focus {
          outline: 2px solid #7ed957;
          box-shadow: 0 0 0 2px #b2f2c9;
        }
        input[type="checkbox"]:checked {
          box-shadow: 0 0 0 2px #7ed957;
        }
      `}</style>
    </div>
  );
}

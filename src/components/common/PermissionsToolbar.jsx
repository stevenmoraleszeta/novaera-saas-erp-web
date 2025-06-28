"use client";
export default function PermissionsToolbar({ permissions, setPermissions, onSave, loading }) {
  const handleSelectAll = () => {
    const all = {};
    Object.keys(permissions).forEach(tableId => {
      all[tableId] = {
        can_read: true,
        can_create: true,
        can_update: true,
        can_delete: true,
      };
    });
    setPermissions(all);
  };

  const handleClearAll = () => {
    const cleared = {};
    Object.keys(permissions).forEach(tableId => {
      cleared[tableId] = {
        can_read: false,
        can_create: false,
        can_update: false,
        can_delete: false,
      };
    });
    setPermissions(cleared);
  };

  return (
    <div className="permissions-toolbar">
      <button onClick={handleSelectAll} disabled={loading}>Seleccionar todo</button>
      <button onClick={handleClearAll} disabled={loading}>Limpiar</button>
      <button onClick={onSave} disabled={loading} style={{ background: "#7ed957", color: "#fff" }}>
        Guardar cambios
      </button>
      <style jsx>{`
        .permissions-toolbar {
          display: flex;
          gap: 1em;
          margin-bottom: 1.5rem;
        }
        button {
          padding: 0.6em 1.4em;
          border-radius: 7px;
          border: 1.5px solid #bdbdbd;
          background: #f7fafc;
          color: #232526;
          font-weight: 600;
          font-size: 1.05em;
          letter-spacing: 0.2px;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          transition: background 0.18s, color 0.18s, box-shadow 0.18s;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        button:not(:last-child):hover {
          background: #e9fbe5;
          color: #43a047;
        }
        button:last-child {
          background: #7ed957;
          color: #fff;
          border: none;
        }
        button:last-child:hover:not(:disabled) {
          background: #43a047;
        }
      `}</style>
    </div>
  );
}

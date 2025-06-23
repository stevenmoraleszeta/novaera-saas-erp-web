"use client";
import { useState } from "react";
import RoleSelector from "../../components/roles/RoleSelector";
import PermissionsMatrix from "../../components/PermissionsMatrix";
import PermissionsToolbar from "../../components/PermissionsToolbar";
import { useRolePermissions } from "../../hooks/useRolePermissions";
import MainContent from "../../components/MainContent";

export default function PermisosPorRolPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const {
    permissions,
    tables,
    loading,
    updatePermission,
    bulkUpdatePermissions,
    setPermissions,
  } = useRolePermissions(selectedRole);

  return (
    <MainContent>
      <div className="permissions-page">
        <h1>Permisos por Rol</h1>
        <RoleSelector value={selectedRole} onChange={setSelectedRole} />
        {selectedRole && (
          <>
            <PermissionsToolbar
              permissions={permissions}
              setPermissions={setPermissions}
              onSave={() => bulkUpdatePermissions(selectedRole, permissions)}
              loading={loading}
            />
            <PermissionsMatrix
              tables={tables}
              permissions={permissions}
              onChange={(tableId, actions) => updatePermission(selectedRole, tableId, actions)}
              loading={loading}
            />
          </>
        )}
        <style jsx>{`
          .permissions-page {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0;
            box-sizing: border-box;
          }
          h1 {
            margin-bottom: 1.2em;
            color: #111827;
            font-size: 2.2em;
            font-weight: 700;
          }
        `}</style>
      </div>
    </MainContent>
  );
}

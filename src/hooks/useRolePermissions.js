"use client";
import { useState, useEffect } from "react";
import { getTables } from "../services/tablesService";
import axios from "../lib/axios";

export function useRolePermissions(roleId) {
  const [permissions, setPermissions] = useState({});
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roleId) return;
    setLoading(true);
    getTables().then(tbls => {
      setTables(tbls);
      // Para cada tabla, obtener los permisos de ese rol
      Promise.all(
        tbls.map(table =>
          axios
            .get(`/permissions/role/${roleId}/table/${table.id}`)
            .then(res => ({
              tableId: table.id,
              ...res.data
            }))
            .catch(() => ({
              tableId: table.id,
              can_read: false,
              can_create: false,
              can_update: false,
              can_delete: false
            }))
        )
      ).then(permsArr => {
        const permsMap = {};
        permsArr.forEach(p => {
          permsMap[p.tableId] = {
            can_read: p.can_read || false,
            can_create: p.can_create || false,
            can_update: p.can_update || false,
            can_delete: p.can_delete || false
          };
        });
        setPermissions(permsMap);
        setLoading(false);
      });
    });
  }, [roleId]);

  const updatePerm = (roleId, tableId, actions) => {
    setPermissions(prev => ({
      ...prev,
      [tableId]: { ...prev[tableId], ...actions }
    }));
  };

  const bulkUpdate = async (roleId, permsMap) => {
    setLoading(true);
    // Aquí puedes hacer requests individuales o implementar un endpoint masivo si lo deseas
    await Promise.all(
      Object.entries(permsMap).map(([tableId, actions]) =>
        axios.post("/permissions", {
          table_id: tableId,
          role_id: roleId,
          ...actions
        })
      )
    );
    setLoading(false);
  };

  return {
    permissions,
    setPermissions,
    tables,
    loading,
    updatePermission: updatePerm,
    bulkUpdatePermissions: bulkUpdate,
    fetchPermissions: () => {},
  };
}

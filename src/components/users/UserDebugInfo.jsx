"use client";

import { useEffect } from "react";
import useUserStore from "../../stores/userStore";

export default function UserDebugInfo() {
  const { user, getUserRoles, hasRole, hasAnyRole } = useUserStore();

  useEffect(() => {
    if (user) {
      console.log("🔍 Debug - Usuario completo:", user);
      console.log("🔍 Debug - Roles del usuario:", getUserRoles());
      console.log("🔍 Debug - ¿Tiene rol 'admin'?", hasRole('admin'));
      console.log("🔍 Debug - ¿Tiene rol 'user'?", hasRole('user'));
      console.log("🔍 Debug - ¿Tiene algún rol admin/super?", hasAnyRole(['admin', 'super']));
    }
  }, [user, getUserRoles, hasRole, hasAnyRole]);

  if (!user) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50">
        <p className="font-bold">Usuario no autenticado</p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 max-w-sm">
      <p className="font-bold">Usuario autenticado:</p>
      <p className="text-sm"><strong>ID:</strong> {user.id}</p>
      <p className="text-sm"><strong>Nombre:</strong> {user.name}</p>
      <p className="text-sm"><strong>Email:</strong> {user.email}</p>
      <p className="text-sm"><strong>Roles:</strong> {getUserRoles().join(', ') || 'Sin roles'}</p>
    </div>
  );
}

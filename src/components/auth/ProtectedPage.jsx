"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthValidation } from "@/hooks/useAuthValidation";

export default function ProtectedPage({ children }) {
  const { isLoading, isAuthenticated, hasCheckedAuth } = useAuthValidation();
  const router = useRouter();

  // Si aún está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si ya se verificó la autenticación y no está autenticado, redirigir
  if (hasCheckedAuth && !isAuthenticated) {
    console.log("[ProtectedPage] Usuario no autenticado, redirigiendo a login");
    router.replace("/login");
    return null;
  }

  // Si está autenticado, mostrar el contenido
  if (isAuthenticated) {
    console.log("[ProtectedPage] Usuario autenticado, mostrando contenido");
    return children;
  }

  // Estado intermedio (no debería llegar aquí)
  return null;
} 
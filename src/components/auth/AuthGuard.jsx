"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/stores/userStore";

export default function AuthGuard({ children }) {
  const { user } = useUserStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dar tiempo al UserInitializer para cargar el usuario
    const timeout = setTimeout(() => {
      if (!user) {
        router.replace("/login");
      }
      setIsLoading(false);
    }, 1500); // Dar 1.5 segundos para que UserInitializer haga su trabajo

    // Si el usuario ya está cargado, no esperar
    if (user) {
      clearTimeout(timeout);
      setIsLoading(false);
    }

    return () => clearTimeout(timeout);
  }, [user, router]);

  // Mostrar loading mientras se verifica la autenticación
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

  // Solo renderizar children si hay usuario
  if (!user) {
    return null; // El redirect ya se hizo en el useEffect
  }

  return children;
}
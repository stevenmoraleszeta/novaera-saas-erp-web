"use client";

import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { getUsers } from "@/services/userService";
import MainContent from "@/components/MainContent";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user, status } = useContext(AuthContext);

  // Estados para las estadísticas
  const [stats, setStats] = useState({
    totalUsers: 0,
    loading: true,
    lastUpdated: null,
  });

  // Cargar estadísticas de usuarios
  useEffect(() => {
    const loadStats = async () => {
      if (status === "authenticated") {
        try {
          setStats((prev) => ({ ...prev, loading: true }));

          // Obtener todos los usuarios para calcular estadísticas
          const response = await getUsers({ limit: 1000 }); // Obtener muchos para contar todos
          const users = response.users || [];

          setStats({
            totalUsers: response.total || users.length,
            loading: false,
            lastUpdated: new Date(),
          });
        } catch (error) {
          console.error("Error loading stats:", error);
          setStats((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    loadStats();
  }, [status]);

  if (status === "authenticating") {
    return (
      <MainContent>
        <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-green-500 rounded-full animate-spin mb-4"></div>
          <span>Cargando dashboard...</span>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <div className="w-full max-w-none m-0 p-0 box-border">
        {/* Welcome Section */}
        <Card className="mb-8 shadow-sm border-green-100 bg-gradient-to-r from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Bienvenido al Sistema ERP
                </h1>
                <p className="text-gray-700 text-lg">
                  Hola <strong>{user?.name || user?.email}</strong>, aquí tienes
                  un resumen de tu sistema.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 bg-green-100 border-3 border-green-200">
                  <AvatarFallback className="text-green-700 text-xl font-bold bg-green-100">
                    {user?.name?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-900">
                    {user?.name || "Usuario"}
                  </span>
                  <Badge variant="secondary" className="capitalize">
                    {user?.role || "Usuario"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-green-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">👥</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {stats.loading ? (
                      <span className="text-gray-400 animate-pulse">...</span>
                    ) : (
                      stats.totalUsers
                    )}
                  </span>
                  <span className="text-gray-600">Usuarios Totales</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">📊</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-gray-900">0</span>
                  <span className="text-gray-600">Reportes Generados</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">🛡️</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-gray-900">0</span>
                  <span className="text-gray-600">Roles Activos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Footer */}
        {stats.lastUpdated && (
          <Card className="mb-8 bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 italic">
                  Última actualización:{" "}
                  {stats.lastUpdated.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-green-50 hover:border-green-200"
                >
                  <span className="text-sm">🔄</span>
                  Actualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group border-green-100 hover:border-green-300">
              <CardContent className="p-6">
                <a
                  href="/usuarios"
                  className="flex items-center gap-4 text-decoration-none"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <span className="text-green-600 text-xl">👥</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Gestionar Usuarios
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Administra usuarios del sistema
                    </p>
                  </div>
                </a>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group border-blue-100 hover:border-blue-300">
              <CardContent className="p-6">
                <a
                  href="/roles"
                  className="flex items-center gap-4 text-decoration-none"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <span className="text-blue-600 text-xl">🛡️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Gestionar Roles
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Administra roles del sistema
                    </p>
                  </div>
                </a>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group border-purple-100 hover:border-purple-300">
              <CardContent className="p-6">
                <a
                  href="/permissions"
                  className="flex items-center gap-4 text-decoration-none"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <span className="text-purple-600 text-xl">🔐</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Gestionar Permisos
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Administra permisos del sistema
                    </p>
                  </div>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainContent>
  );
}

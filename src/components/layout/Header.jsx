"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Settings,
  Edit3,
  Users,
  Shield,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useUserStore from "../../stores/userStore";
import useTabStore from "../../stores/tabStore";
import { useEditMode } from "../../hooks/useEditMode";
import NotificationDropdown from "../navbar/NotificationDropdown";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { logout as authServiceLogout } from "@/services/authService";
import { useRoles } from '@/hooks/useRoles';

export default function Header() {
  const { user, clearUser } = useUserStore();
  const { isEditingMode, toggleEditMode, resetEditMode, isHydrated } = useEditMode();
  const { clearTabs } = useTabStore();
  const router = useRouter();
  const pathname = usePathname();

  const { roles, fetchRoles } = useRoles();

  const isUserAdmin = useMemo(() => {
    return roles.some(role =>
      user.roles.includes(role.name) && role.is_admin
    );

  }, [roles, user.roles])

  console.log("issue:  isUserAdmin", isUserAdmin)

  // Debug: Log del modo edición en el header
  console.log("🔧 Header - Modo edición:", isEditingMode, "Hidratado:", isHydrated);

  // Desactivar modo edición al cambiar de página
  useEffect(() => {
    console.log("issue: CHEEEEEEEEEEEEEEEEEEEEERUPPP", user.roles)
    if (isEditingMode) {
      resetEditMode();
    }
  }, [pathname, resetEditMode]);

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handleToggleEditMode = () => {
    console.log("🔧 Toggle modo edición - Estado actual:", isEditingMode);
    toggleEditMode();
    console.log("🔧 Toggle modo edición - Después del toggle");
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear httpOnly cookie
      await authServiceLogout();
      clearUser();
      clearTabs();
      resetEditMode();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: just clear local state
      clearUser();
      clearTabs();
      resetEditMode();
      router.push("/");
    }
  };

  return (
    <header className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-[5000]">
      <Link href="/">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          ERPLOGO
        </h1>
      </Link>
      <div className="flex items-center space-x-2">
        {/* Edit Mode Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {isUserAdmin && (
                <Button
                  variant={isEditingMode ? "default" : "ghost"}
                  size="icon"
                  onClick={handleToggleEditMode}
                  className={isEditingMode ? "bg-black" : ""}
                >
                  <Edit3 className="w-5 h-5" />
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isEditingMode
                  ? "Modo edición activo"
                  : "Cambiar a modo edición"}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Configuración del Sistema</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleNavigation("/usuarios")}>
                <Users className="w-4 h-4 mr-2" />
                Usuarios
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigation("/roles")}>
                <Shield className="w-4 h-4 mr-2" />
                Roles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </TooltipProvider>
      </div>
    </header>
  );
}

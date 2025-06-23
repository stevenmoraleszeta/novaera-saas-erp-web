"use client";

import React from "react";
import {
  Settings,
  Bell,
  Edit3,
  Eye,
  Users,
  Shield,
  Key,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useUserStore from "../stores/userStore";
import useEditModeStore from "../stores/editModeStore";
import useTabStore from "../stores/tabStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout as authServiceLogout } from "@/services/authService";

export default function Header() {
  const { user, clearUser } = useUserStore();
  const { isEditingMode, toggleEditMode, resetEditMode } = useEditModeStore();
  const { clearTabs } = useTabStore();
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear httpOnly cookie
      await authServiceLogout();
      clearUser();
      clearTabs();
      resetEditMode();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: just clear local state
      clearUser();
      clearTabs();
      resetEditMode();
      router.push("/login");
    }
  };

  return (
    <header className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
              <Button
                variant={isEditingMode ? "default" : "outline"}
                size="icon"
                onClick={toggleEditMode}
                className={
                  isEditingMode ? "bg-green-600 hover:bg-green-700" : ""
                }
              >
                {isEditingMode ? (
                  <Edit3 className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>
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
              <DropdownMenuItem
                onClick={() => handleNavigation("/permissions")}
              >
                <Key className="w-4 h-4 mr-2" />
                Permisos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notificaciones</p>
            </TooltipContent>
          </Tooltip>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full cursor-pointer"
              >
                <Avatar className="text-black w-8 h-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
      </div>
    </header>
  );
}

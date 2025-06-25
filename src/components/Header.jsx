"use client";

import React, { useState } from "react";
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
  Check,
  Trash2,
  RefreshCw,
  ExternalLink,
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
import { Badge } from "@/components/ui/badge";
import useUserStore from "../stores/userStore";
import useEditModeStore from "../stores/editModeStore";
import useTabStore from "../stores/tabStore";
import { useNotifications } from "../hooks/useNotifications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout as authServiceLogout } from "@/services/authService";

export default function Header() {
  const { user, clearUser } = useUserStore();
  const { isEditingMode, toggleEditMode, resetEditMode } = useEditModeStore();
  const { clearTabs } = useTabStore();
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Notifications hook
  const {
    notifications,
    unreadCount,
    loading,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    fetchNotifications,
  } = useNotifications(user?.id);

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

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // If notification has a link, navigate to it
    if (notification.linkToModule) {
      router.push(notification.linkToModule);
    }

    setNotificationsOpen(false);
  };

  const handleMarkAllAsReadClick = async () => {
    await handleMarkAllAsRead();
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    await handleDelete(notificationId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return "Hace unos minutos";
      } else if (diffInHours < 24) {
        return `Hace ${Math.floor(diffInHours)}h`;
      } else {
        return date.toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
        });
      }
    } catch (error) {
      return "";
    }
  };

  const getStatusBadge = (isRead) => {
    return isRead ? (
      <Badge
        variant="secondary"
        className="bg-green-100 text-green-800 text-xs"
      >
        Leída
      </Badge>
    ) : (
      <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
        Nueva
      </Badge>
    );
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

          {/* Notifications Dropdown */}
          <DropdownMenu
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-2 border-b">
                <DropdownMenuLabel className="text-base font-semibold">
                  Notificaciones
                </DropdownMenuLabel>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchNotifications}
                    disabled={loading}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
                    />
                  </Button>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsReadClick}
                      className="h-6 px-2 text-xs"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Marcar todas
                    </Button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Cargando...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay notificaciones</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {notifications.slice(0, 10).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            {getStatusBadge(notification.isRead)}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatDate(notification.createdAt)}
                            </span>
                            {notification.linkToModule && (
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) =>
                            handleDeleteNotification(e, notification.id)
                          }
                          className="h-6 w-6 p-0 ml-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}

              {notifications.length > 10 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/notifications"
                      className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-700"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      Ver todas las notificaciones
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full cursor-pointer"
              >
                <Avatar className="text-black w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
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

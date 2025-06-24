"use client";

import React, { useState } from "react";
import useUserStore from "@/stores/userStore";
import { useNotifications } from "@/hooks/useNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, Search, Check, Trash2, Filter, RefreshCw } from "lucide-react";
import Alert from "@/components/Alert";

export default function NotificationCenterPage() {
  const { user } = useUserStore();
  const {
    notifications,
    unreadCount,
    handleSearch,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    handleDeleteAll,
    fetchNotifications,
    loading,
    error,
    success,
    clearMessages,
  } = useNotifications(user?.id);

  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleRowClick = async (notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const getStatusBadge = (read) => {
    return read ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Leída
      </Badge>
    ) : (
      <Badge variant="default" className="bg-blue-100 text-blue-800">
        No leída
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Centro de Notificaciones
            </h1>
            <p className="text-gray-600">
              {unreadCount > 0
                ? `${unreadCount} notificación${
                    unreadCount > 1 ? "es" : ""
                  } no leída${unreadCount > 1 ? "s" : ""}`
                : "Todas las notificaciones han sido leídas"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            onClick={handleMarkAllAsRead}
            disabled={loading || unreadCount === 0}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Marcar todas como leídas
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && <Alert type="error" message={error} onClose={clearMessages} />}
      {success && (
        <Alert type="success" message={success} onClose={clearMessages} />
      )}

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar notificaciones..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter */}
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">No leídas</SelectItem>
                  <SelectItem value="read">Leídas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {filteredNotifications.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleDeleteAll}
                  disabled={loading}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar todas
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notificaciones</span>
            <span className="text-sm font-normal text-gray-500">
              {filteredNotifications.length} resultado
              {filteredNotifications.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">
                Cargando notificaciones...
              </span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchQuery || filter !== "all"
                  ? "No se encontraron notificaciones con los filtros aplicados"
                  : "No hay notificaciones disponibles"}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="w-12">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow
                      key={notification.id}
                      onClick={() => handleRowClick(notification)}
                      className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                    >
                      <TableCell>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {notification.title}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {notification.message}
                      </TableCell>
                      <TableCell>{getStatusBadge(notification.read)}</TableCell>
                      <TableCell>
                        {formatDate(notification.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";
import UsersTable from "./UsersTable";
import SearchBar from "./SearchBar";
import Pagination from "./Pagination";
import { Badge } from "@/components/ui/badge";

export default function UserList({
  users = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  isEditingMode = false,
  searchQuery = "",
  onSearch,
  onRefresh,
}) {
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const handleSort = (newSortConfig) => {
    setSortConfig(newSortConfig);
    // You can add sorting logic here if needed
  };

  const handleToggleStatus = (user) => {
    if (onToggleStatus) {
      onToggleStatus(user);
    }
  };

  const handleView = (user) => {
    if (onView) {
      onView(user);
    } else {
      // Default view behavior - could navigate to detail page
      console.log("View user:", user);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <Badge variant="secondary" className="text-sm">
            {totalItems} usuarios
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
          )}

          {onAdd && (
            <Button onClick={onAdd} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          )}
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={onSearch}
            loading={loading}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <UsersTable
          users={users}
          loading={loading}
          onEdit={onEdit}
          onView={handleView}
          onDelete={onDelete}
          onToggleStatus={handleToggleStatus}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Empty state */}
      {!loading && users.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? "No hay usuarios que coincidan con tu búsqueda."
              : "Aún no hay usuarios registrados en el sistema."}
          </p>
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primer usuario
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

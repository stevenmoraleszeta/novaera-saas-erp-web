"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { getUsers, getUserRoles } from "@/services/userService";
import GenericCRUDTable from "@/components/common/GenericCRUDTable";
import { Button } from "@/components/ui/button";
import {
  Database,
  Edit3,
  Plus,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Check,
  Users
} from "lucide-react";
import useEditModeStore from "@/stores/editModeStore";
import SearchBar from "@/components/common/SearchBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function UsersTableView({
  refresh = false,
  onRowClick,
  onCreateUser,
  showCreateButton = true,
  showActionButtons = true,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [localRefreshFlag, setLocalRefreshFlag] = useState(false);
  
  // Filter and sort states
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeSort, setActiveSort] = useState({ column: "name", direction: "asc" });
  const [showFilterManager, setShowFilterManager] = useState(false);
  const [showSortManager, setShowSortManager] = useState(false);
  const [showColumnVisibilityDialog, setShowColumnVisibilityDialog] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  
  // Filter and sort drafts
  const [filterDraft, setFilterDraft] = useState({ column: "", condition: "", value: "" });
  const [sortConfig, setSortConfig] = useState({ column: "", direction: "" });
  
  // Table editing states
  const [isEditingName, setIsEditingName] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [nameError, setNameError] = useState("");
  const [tableMeta, setTableMeta] = useState({ name: "Gestión de Usuarios" });
  
  // Delete confirmation
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState(null);
  
  // Store
  const { isEditingMode } = useEditModeStore();

  // Available filter conditions
  const filterConditions = [
    { value: "contains", label: "Contiene" },
    { value: "equals", label: "Igual a" },
    { value: "starts_with", label: "Comienza con" },
    { value: "ends_with", label: "Termina con" },
    { value: "greater", label: "Mayor que" },
    { value: "lower", label: "Menor que" },
    { value: "is_null", label: "Es nulo" },
    { value: "is_not_null", label: "No es nulo" },
  ];

  // Columnas definidas para usuarios
  const columns = [
    { name: "id", data_type: "int", column_id: 1 },
    { name: "name", data_type: "text", column_id: 2 },
    { name: "email", data_type: "text", column_id: 3 },
    { name: "role", data_type: "text", column_id: 4 },
  ];

  useEffect(() => {
    const initialVisibility = {};
    columns.forEach((col) => {
      initialVisibility[col.name] = true;
    });
    setColumnVisibility(initialVisibility);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getUsers();
        const usersData = response.users || [];
        
        // Enriquecer usuarios con sus roles
        const enrichedUsers = await Promise.all(
          usersData.map(async (user) => {
            try {
              const userRoles = await getUserRoles(user.id);
              
              // Obtener el rol principal
              let primaryRole = "Sin rol";
              if (userRoles && userRoles.length > 0) {
                if (typeof userRoles[0] === 'string') {
                  primaryRole = userRoles[0];
                } else if (userRoles[0] && userRoles[0].name) {
                  primaryRole = userRoles[0].name;
                } else if (userRoles[0]) {
                  primaryRole = userRoles[0].toString();
                }
              }
              
              return {
                id: user.id,
                name: user.name || "Sin nombre",
                email: user.email || "Sin email",
                role: primaryRole,
                created_at: user.created_at,
                // Datos originales para el modal
                record_data: user,
              };
            } catch (err) {
              console.warn(`Error fetching roles for user ${user.id}:`, err);
              return {
                id: user.id,
                name: user.name || "Sin nombre",
                email: user.email || "Sin email",
                role: "Sin rol",
                created_at: user.created_at,
                // Datos originales para el modal
                record_data: user,
              };
            }
          })
        );

        setUsers(enrichedUsers);
        setTotal(enrichedUsers?.length || 0);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, pageSize, refresh, localRefreshFlag]);

  const handleDeleteRecord = async (record) => {
    setDeleteConfirmRecord(record);
  };

  const confirmDeleteRecord = async () => {
    if (!deleteConfirmRecord) return;

    try {
      // Note: You'll need to implement deleteUser service
      // await deleteUser(deleteConfirmRecord.id);
      console.log("Delete user:", deleteConfirmRecord.id);
      setDeleteConfirmRecord(null);
      setLocalRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const cancelDeleteRecord = () => {
    setDeleteConfirmRecord(null);
  };

  const getDefaultValuesFromFilters = (filters) => {
    const defaults = {};
    filters.forEach((filter) => {
      if (filter.condition === "equals") {
        defaults[filter.column] = filter.value;
      }
    });
    return defaults;
  };

  // Memoized columns with visibility filtering
  const visibleColumns = useMemo(() => {
    return columns.filter((col) => columnVisibility[col.name] !== false);
  }, [columns, columnVisibility]);

  // Memoized table columns
  const tableColumnsWithActions = useMemo(() => {
    return visibleColumns.map((col) => ({
      ...col,
      key: col.name, // Add the key property for React
      header: col.name === "id" ? "ID" : 
              col.name === "name" ? "Nombre" : 
              col.name === "email" ? "Email" : 
              col.name === "role" ? "Rol" : 
              col.name,
      width: col.data_type === "int" ? "80px" : "auto",
      render: (value, record) => {
        if (col.name === "created_at" && value) {
          try {
            return new Date(value).toLocaleDateString("es-ES");
          } catch {
            return "N/A";
          }
        }
        if (col.name === "role") {
          return value || "Sin rol";
        }
        return value || "";
      },
    }));
  }, [visibleColumns]);

  // Apply filters
  const processedRecords = useMemo(() => {
    let filtered = [...users];

    // Apply active filters
    activeFilters.forEach((filter) => {
      filtered = filtered.filter((record) => {
        const value = record[filter.column];
        const filterValue = filter.value;

        switch (filter.condition) {
          case "contains":
            return value?.toString().toLowerCase().includes(filterValue.toLowerCase());
          case "equals":
            return value?.toString().toLowerCase() === filterValue.toLowerCase();
          case "starts_with":
            return value?.toString().toLowerCase().startsWith(filterValue.toLowerCase());
          case "ends_with":
            return value?.toString().toLowerCase().endsWith(filterValue.toLowerCase());
          case "greater":
            return parseFloat(value) > parseFloat(filterValue);
          case "lower":
            return parseFloat(value) < parseFloat(filterValue);
          case "is_null":
            return value === null || value === undefined || value === "";
          case "is_not_null":
            return value !== null && value !== undefined && value !== "";
          default:
            return true;
        }
      });
    });

    // Apply sorting
    if (activeSort.column) {
      filtered.sort((a, b) => {
        const aVal = a[activeSort.column];
        const bVal = b[activeSort.column];
        
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        const comparison = aVal < bVal ? -1 : 1;
        return activeSort.direction === "desc" ? -comparison : comparison;
      });
    }

    return filtered;
  }, [users, activeFilters, activeSort]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm) {
      return processedRecords;
    }

    return processedRecords.filter((row) => {
      return columns.some((col) => {
        const cellValue = row[col.name];
        if (cellValue === null || cellValue === undefined) return false;
        return cellValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [processedRecords, searchTerm, columns]);

  const handleAddFilter = () => {
    if (
      !filterDraft.column ||
      !filterDraft.condition ||
      (filterDraft.condition !== "is_null" &&
        filterDraft.condition !== "is_not_null" &&
        filterDraft.value === "")
    ) {
      return;
    }

    setActiveFilters((prev) => [...prev, filterDraft]);
    setFilterDraft({ column: "", condition: "", value: "" });
    setShowFilterManager(false);
  };

  const handleSetSort = () => {
    if (!sortConfig?.column || !sortConfig?.direction) {
      return;
    }

    setActiveSort({
      column: sortConfig.column,
      direction: sortConfig.direction,
    });

    setShowSortManager(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!columns.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">
            No hay columnas definidas
          </h3>
          <p className="text-sm">Esta tabla no tiene columnas configuradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        {isEditingName ? (
          <>
            <input
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-400 focus:outline-none focus:border-black w-[300px]"
              maxLength={50}
              autoFocus
            />
            <button
              onClick={async () => {
                const trimmed = newTableName.trim();
                if (trimmed.length === 0) {
                  setNameError("El nombre no puede estar vacío");
                  return;
                }
                if (trimmed.length > 50) {
                  setNameError("El nombre no puede tener más de 50 caracteres");
                  return;
                }
                try {
                  setTableMeta(prev => ({ ...prev, name: trimmed }));
                  setIsEditingName(false);
                  setNameError("");
                } catch (error) {
                  setNameError("Error al actualizar el nombre");
                }
              }}
              className="text-gray-500 hover:text-gray-800"
              title="Guardar nombre"
            >
              <Check className="w-6 h-6" />
            </button>
          </>
        ) : (
          <>
            <span className="text-3xl font-bold text-gray-900">
              {tableMeta?.name || "Gestión de Usuarios"}
            </span>
            {isEditingMode && (
              <button
                onClick={() => {
                  setNewTableName(tableMeta?.name || "Gestión de Usuarios");
                  setIsEditingName(true);
                }}
                className="text-gray-500 hover:text-gray-800"
                title="Editar nombre"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>
      {nameError && (
        <span className="text-red-500 text-sm mt-1">{nameError}</span>
      )}
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <button
              className="px-4 py-1 font-semibold text-sm border bg-black text-white shadow border-black"
            >
              Vista General
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setShowFilterManager(true)}
          >
            <Filter className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setShowSortManager(true)}
          >
            <ArrowUpDown className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setShowColumnVisibilityDialog(true)}
          >
            <Eye className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <SearchBar
              onSearch={setSearchTerm}
              debounceDelay={200}
              placeholder="Buscar..."
            />
          </div>
          
          {showCreateButton && (
            <Button
              onClick={() => {
                if (onCreateUser) {
                  onCreateUser();
                }
              }}
              size="lg"
              className="w-[150px] h-[36px] rounded-[5px] flex items-center justify-center"
            >
              <span
                className="w-[82px] h-[31px] flex items-center justify-center"
                style={{ fontSize: "20px" }}
              >
                Nuevo
              </span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap mb-2 items-center">
      </div>
      
      <div
        className="flex-1 overflow-hidden bg-white relative"
        style={{ borderRadius: 0 }}
      >
        {columns.length > 0 && (
          <div className="h-full overflow-auto">
            <GenericCRUDTable
              title={tableMeta?.name || "Usuarios"}
              data={filteredRecords}
              useFilter={false}
              columns={tableColumnsWithActions}
              rawColumns={columns}
              isDraggableColumnEnabled={false}
              onRowClick={onRowClick}
              getRowKey={(row) => row.id}
              onCreate={showCreateButton ? () => {
                if (onCreateUser) {
                  onCreateUser();
                }
              } : undefined}
              onUpdate={showActionButtons ? (id, updatedData) => {
                // Handle update if needed
                console.log("Update user:", id, updatedData);
              } : undefined}
              onDelete={showActionButtons ? handleDeleteRecord : undefined}
              rowIdKey="id"
              permissions={{
                canCreate: showCreateButton,
                canRead: true,
                canUpdate: showActionButtons,
                canDelete: showActionButtons
              }}
              renderForm={({ mode, item, open, onClose, onSubmit }) => (
                <div></div>
              )}
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      {deleteConfirmRecord && (
        <Dialog open={true} onOpenChange={() => setDeleteConfirmRecord(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
            </DialogHeader>
            <p>¿Estás seguro de que quieres eliminar este usuario?</p>
            <DialogFooter>
              <Button variant="outline" onClick={cancelDeleteRecord}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDeleteRecord}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Filter Dialog */}
      {showFilterManager && (
        <Dialog open={showFilterManager} onOpenChange={setShowFilterManager}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gestionar Filtros</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Columna</Label>
                <select
                  value={filterDraft.column}
                  onChange={(e) => setFilterDraft(prev => ({ ...prev, column: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccionar columna</option>
                  {columns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Condición</Label>
                <select
                  value={filterDraft.condition}
                  onChange={(e) => setFilterDraft(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccionar condición</option>
                  {filterConditions.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Valor</Label>
                <Input
                  value={filterDraft.value}
                  onChange={(e) => setFilterDraft(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Valor del filtro"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFilterManager(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddFilter}>
                Agregar Filtro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Sort Dialog */}
      {showSortManager && (
        <Dialog open={showSortManager} onOpenChange={setShowSortManager}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gestionar Ordenamiento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Columna</Label>
                <select
                  value={sortConfig.column}
                  onChange={(e) => setSortConfig(prev => ({ ...prev, column: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccionar columna</option>
                  {columns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Dirección</Label>
                <select
                  value={sortConfig.direction}
                  onChange={(e) => setSortConfig(prev => ({ ...prev, direction: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccionar dirección</option>
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSortManager(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSetSort}>
                Aplicar Ordenamiento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Column Visibility Dialog */}
      {showColumnVisibilityDialog && (
        <Dialog open={showColumnVisibilityDialog} onOpenChange={setShowColumnVisibilityDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Visibilidad de Columnas</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {columns.map(col => (
                <div key={col.name} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={col.name}
                    checked={columnVisibility[col.name] !== false}
                    onChange={(e) => setColumnVisibility(prev => ({
                      ...prev,
                      [col.name]: e.target.checked
                    }))}
                  />
                  <label htmlFor={col.name}>{col.name}</label>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowColumnVisibilityDialog(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

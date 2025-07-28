"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { XIcon, AlertCircle, Save, Edit, Trash2, Shield, Users, Settings } from "lucide-react";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useEditModeStore from "@/stores/editModeStore";

export default function RolePermissionsModal({
  open = false,
  onOpenChange,
  role = null,
  onSaveRole,
  onDeleteRole,
  loading = false,
}) {
  const { isEditingMode } = useEditModeStore();
  const axios = useAxiosAuth();
  
  // Estados para el rol
  const [formData, setFormData] = useState({
    nombre: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // Estados para permisos
  const [tables, setTables] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsDirty, setPermissionsDirty] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  useEffect(() => {
    if (open) {
      // Cargar tablas y permisos siempre que se abra el modal
      loadTablesAndPermissions();
      
      if (role) {
        // Cargar datos del rol existente
        setFormData({
          nombre: role.name || role.record_data?.name || "",
        });
      } else {
        // Reset para nuevo rol
        setFormData({
          nombre: "",
        });
      }
    }
    setErrors({});
    setSubmitError(null);
    setIsDirty(false);
    setPermissionsDirty(false);
  }, [open, role]);

  const loadTablesAndPermissions = async () => {
    setPermissionsLoading(true);
    try {
      // Extraer el ID del rol
      const roleId = role?.record_data?.id || role?.id || role?.role_id || role?.Id || role?.ID;
      
      // Cargar todas las tablas
      const tablesRes = await axios.get('/tables');
      setTables(tablesRes.data || []);

      // Cargar permisos actuales del rol si existe
      if (roleId) {
        const permsRes = await axios.get(`/permissions/role/${roleId}`);
        
        const rolePermissions = {};
        
        // Inicializar permisos en false para todas las tablas
        (tablesRes.data || []).forEach(table => {
          rolePermissions[table.id] = {
            can_create: false,
            can_read: false,
            can_update: false,
            can_delete: false
          };
        });

        // Aplicar permisos existentes
        (permsRes.data || []).forEach(perm => {
          if (rolePermissions[perm.table_id]) {
            rolePermissions[perm.table_id] = {
              can_create: perm.can_create,
              can_read: perm.can_read,
              can_update: perm.can_update,
              can_delete: perm.can_delete
            };
          }
        });

        setPermissions(rolePermissions);
      } else {
        // Para nuevo rol, inicializar permisos en false
        const rolePermissions = {};
        (tablesRes.data || []).forEach(table => {
          rolePermissions[table.id] = {
            can_create: false,
            can_read: false,
            can_update: false,
            can_delete: false
          };
        });
        setPermissions(rolePermissions);
      }
    } catch (error) {
      console.error('Error loading tables and permissions:', error);
      setSubmitError('Error al cargar tablas y permisos');
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
    setIsDirty(true);
  };

  const handlePermissionChange = (tableId, permission, checked) => {
    setPermissions(prev => ({
      ...prev,
      [tableId]: {
        ...prev[tableId],
        [permission]: checked
      }
    }));
    setPermissionsDirty(true);
  };

  const toggleColumn = (permissionType) => {
    setPermissions(prev => {
      const allChecked = tables.every(table => prev[table.id]?.[permissionType]);
      const updated = { ...prev };
      tables.forEach(table => {
        updated[table.id] = {
          ...updated[table.id],
          [permissionType]: !allChecked
        };
      });
      return updated;
    });
    setPermissionsDirty(true);
  };

  const toggleRow = (tableId) => {
    setPermissions(prev => {
      const currentPermissions = prev[tableId] || {};
      const allChecked = Object.values(currentPermissions).every(Boolean);
      const updated = { ...prev };
      updated[tableId] = {
        can_create: !allChecked,
        can_read: !allChecked,
        can_update: !allChecked,
        can_delete: !allChecked
      };
      return updated;
    });
    setPermissionsDirty(true);
  };

  const selectAllPermissions = () => {
    setPermissions(prev => {
      const updated = { ...prev };
      tables.forEach(table => {
        updated[table.id] = {
          can_create: true,
          can_read: true,
          can_update: true,
          can_delete: true
        };
      });
      return updated;
    });
    setPermissionsDirty(true);
  };

  const deselectAllPermissions = () => {
    setPermissions(prev => {
      const updated = { ...prev };
      tables.forEach(table => {
        updated[table.id] = {
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false
        };
      });
      return updated;
    });
    setPermissionsDirty(true);
  };

  const toggleAllPermissions = () => {
    const allChecked = tables.every(table =>
      Object.values(permissions[table.id] || {}).every(Boolean)
    );
    setPermissions(prev => {
      const updated = { ...prev };
      tables.forEach(table => {
        updated[table.id] = {
          can_create: !allChecked,
          can_read: !allChecked,
          can_update: !allChecked,
          can_delete: !allChecked
        };
      });
      return updated;
    });
    setPermissionsDirty(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre del rol es requerido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitError(null);

    try {
      let roleId = role?.record_data?.id || role?.id || role?.role_id || role?.Id || role?.ID;
      
      // Guardar datos del rol si hay cambios
      if (isDirty) {
        const savedRole = await onSaveRole(formData);
        // Si es un nuevo rol, obtener el ID del rol creado
        if (!roleId && savedRole) {
          roleId = savedRole.id || savedRole.record_data?.id;
        }
      }
      
      // Guardar permisos si hay cambios y tenemos un roleId
      if (permissionsDirty && roleId) {
        setSavingPermissions(true);
        try {
          await axios.post(`/permissions/role/${roleId}/bulk`, { permissions });
          setPermissionsDirty(false);
        } catch (error) {
          console.error('Error saving permissions:', error);
          setSubmitError('Error al guardar los permisos');
          return;
        } finally {
          setSavingPermissions(false);
        }
      }
      
      setIsDirty(false);
      onOpenChange?.(false);
    } catch (error) {
      setSubmitError(error?.response?.data?.message || "Error al guardar");
    }
  };

  const handleDelete = () => {
    if (role && onDeleteRole) {
      onDeleteRole(role);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-10 bg-black/30 flex items-start justify-center px-4 py-28">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[1150px] relative z-10 flex flex-col overflow-hidden h-[80vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold">
            {role ? "Editar Rol" : "Nuevo Rol"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="bg-black text-white ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            aria-label="Cerrar modal"
          >
            <XIcon />
          </button>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto px-4 py-2 flex-1">
          <form noValidate className="space-y-6">
            {/* Campo del nombre del rol */}
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre del Rol
                <Badge className="ml-1 text-xs text-destructive bg-transparent">
                  *Requerido
                </Badge>
              </Label>
              <Input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Ej: Administrador, Usuario, Editor..."
                className={`h-11 ${errors.nombre ? "border-red-500" : ""}`}
                disabled={loading}
                autoFocus
              />
              {errors.nombre && (
                <div className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.nombre}
                </div>
              )}
            </div>

            {/* Sección de permisos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Matriz de Permisos</h3>
              </div>

              {permissionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Cargando permisos...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Configura los permisos de acceso para este rol en cada tabla del sistema.
                  </div>
                  
                  {/* Botón para seleccionar/deseleccionar todos los permisos */}
                  <div className="flex items-center mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={toggleAllPermissions}
                    >
                      Seleccionar/Deseleccionar todo
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/3">Tabla</TableHead>
                          <TableHead className="text-center w-1/6">
                            <div className="flex flex-col items-center">
                              <span>Crear</span>
                              <div
                                className="p-1 mt-1 hover:bg-gray-100 rounded"
                                title="Seleccionar/deseleccionar toda la columna"
                              >
                                <Checkbox
                                  checked={tables.every(table => permissions[table.id]?.can_create)}
                                  onCheckedChange={() => toggleColumn('can_create')}
                                />
                              </div>
                            </div>
                          </TableHead>
                          <TableHead className="text-center w-1/6">
                            <div className="flex flex-col items-center">
                              <span>Leer</span>
                              <div
                                className="p-1 mt-1 hover:bg-gray-100 rounded"
                                title="Seleccionar/deseleccionar toda la columna"
                              >
                                <Checkbox
                                  checked={tables.every(table => permissions[table.id]?.can_read)}
                                  onCheckedChange={() => toggleColumn('can_read')}
                                />
                              </div>
                            </div>
                          </TableHead>
                          <TableHead className="text-center w-1/6">
                            <div className="flex flex-col items-center">
                              <span>Actualizar</span>
                              <div
                                className="p-1 mt-1 hover:bg-gray-100 rounded"
                                title="Seleccionar/deseleccionar toda la columna"
                              >
                                <Checkbox
                                  checked={tables.every(table => permissions[table.id]?.can_update)}
                                  onCheckedChange={() => toggleColumn('can_update')}
                                />
                              </div>
                            </div>
                          </TableHead>
                          <TableHead className="text-center w-1/6">
                            <div className="flex flex-col items-center">
                              <span>Eliminar</span>
                              <div
                                className="p-1 mt-1 hover:bg-gray-100 rounded"
                                title="Seleccionar/deseleccionar toda la columna"
                              >
                                <Checkbox
                                  checked={tables.every(table => permissions[table.id]?.can_delete)}
                                  onCheckedChange={() => toggleColumn('can_delete')}
                                />
                              </div>
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tables.map((table) => (
                          <TableRow key={table.id} className="hover:bg-gray-50">
                            <TableCell 
                              className="font-medium cursor-pointer"
                              onClick={() => toggleRow(table.id)}
                              title="Click para seleccionar/deseleccionar todos los permisos de esta tabla"
                            >
                              {table.name}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={permissions[table.id]?.can_create || false}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(table.id, 'can_create', checked)
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={permissions[table.id]?.can_read || false}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(table.id, 'can_read', checked)
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={permissions[table.id]?.can_update || false}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(table.id, 'can_update', checked)
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={permissions[table.id]?.can_delete || false}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(table.id, 'can_delete', checked)
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>

            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>

        {/* Footer con botones */}
        <div className="border-t p-4 flex justify-between">
          {/* Izquierda: Guardar y Eliminar */}
          <div className="flex gap-2">
            <Button 
              type="submit" 
              onClick={handleSave} 
              disabled={loading || savingPermissions}
            >
              {loading || savingPermissions ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>Guardar</>
              )}
            </Button>
            
            {isEditingMode && role && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={loading || savingPermissions}
              >
                Eliminar
              </Button>
            )}
          </div>

          {/* Derecha: Estado de cambios */}
          <div className="flex gap-2">
            {isDirty && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                Datos modificados
              </span>
            )}
            {permissionsDirty && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                Permisos modificados
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

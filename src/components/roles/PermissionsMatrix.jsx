import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAxiosAuth } from '@/hooks/useAxiosAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { updateRole } from '@/services/roleService'
import { useRoles } from '@/hooks/useRoles';


const PermissionsMatrix = ({ selectedRole, onPermissionsChange }) => {
  const axios = useAxiosAuth();
  const [tables, setTables] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { roles, fetchRoles } = useRoles();


  useEffect(() => {
    if (selectedRole) {
      loadTablesAndPermissions();
      setIsAdmin(
        selectedRole?.record_data?.is_admin ??
        selectedRole?.is_admin ??
        false
      );
    }
  }, [selectedRole]);

  const loadTablesAndPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading tables and permissions for role:', selectedRole);
      console.log('Role object keys:', Object.keys(selectedRole));
      console.log('Role object values:', selectedRole);

      // Extraer el ID del rol desde record_data o directamente
      const roleId = selectedRole.record_data?.id || selectedRole.id || selectedRole.role_id || selectedRole.Id || selectedRole.ID;
      console.log('Extracted role ID:', roleId);

      // Cargar todas las tablas
      const tablesRes = await axios.get('/tables');
      console.log('Tables response:', tablesRes.data);
      setTables(tablesRes.data || []);

      // Cargar permisos actuales del rol
      if (selectedRole && roleId) {
        console.log('Fetching permissions for role ID:', roleId);
        const permsRes = await axios.get(`/permissions/role/${roleId}`);
        console.log('Permissions response:', permsRes.data);

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
          console.log('Processing permission:', perm);
          if (rolePermissions[perm.table_id]) {
            rolePermissions[perm.table_id] = {
              can_create: perm.can_create,
              can_read: perm.can_read,
              can_update: perm.can_update,
              can_delete: perm.can_delete
            };
          }
        });

        console.log('Final permissions state:', rolePermissions);
        setPermissions(rolePermissions);
      } else {
        console.error('No role ID found in selectedRole:', selectedRole);
        setError('No se pudo determinar el ID del rol');
      }
    } catch (err) {
      console.error('Error loading tables and permissions:', err);
      setError('Error al cargar tablas y permisos');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (tableId, permission, checked) => {
    setPermissions(prev => ({
      ...prev,
      [tableId]: {
        ...prev[tableId],
        [permission]: checked
      }
    }));
  };

  const savePermissions = async () => {
    if (!selectedRole) return;

    // Extraer el ID del rol desde record_data o directamente
    const roleId = selectedRole.record_data?.id || selectedRole.id || selectedRole.role_id || selectedRole.Id || selectedRole.ID;

    if (!roleId) {
      setError('No se pudo determinar el ID del rol');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      console.log('Saving permissions for role ID:', roleId);
      console.log('Permissions to save:', permissions);

      // Use the bulk update endpoint
      await axios.post(`/permissions/role/${roleId}/bulk`, { permissions });

      // Notificar sobre el cambio
      if (onPermissionsChange) {
        onPermissionsChange();
      }

      console.log('Permisos guardados exitosamente');

      // Mostrar modal de éxito
      await updateRole({ id: roleId, name: selectedRole.name, is_admin: isAdmin });
      console.log("issue 11111111111111111111111111111111111111")
      fetchRoles();
      console.log("issue 222222222222222222222222222222222222222")
      setShowSuccessModal(true);

    } catch (err) {
      console.error('Error saving permissions:', err);
      setError('Error al guardar permisos');
    } finally {
      setSaving(false);
    }
  };

  // Invierte todos los permisos de una columna
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
  };

  // Invierte todos los permisos de una fila (tabla)
  const toggleRow = (tableId) => {
    setPermissions(prev => {
      const allChecked = Object.values(prev[tableId] || {}).every(Boolean);
      const updated = { ...prev };
      updated[tableId] = Object.fromEntries(
        Object.entries(prev[tableId] || {}).map(([perm, val]) => [perm, !allChecked])
      );
      return updated;
    });
  };

  // Invierte todos los permisos de la matriz
  const toggleAll = () => {
    const allChecked = tables.every(table =>
      Object.values(permissions[table.id] || {}).every(Boolean)
    );
    setPermissions(prev => {
      const updated = { ...prev };
      tables.forEach(table => {
        updated[table.id] = Object.fromEntries(
          Object.entries(prev[table.id] || {}).map(([perm, val]) => [perm, !allChecked])
        );
      });
      return updated;
    });
  };

  if (!selectedRole) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">Selecciona un rol para gestionar sus permisos</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Cargando permisos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mensaje de error */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
          {error}
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isAdmin"
          checked={isAdmin}
          onCheckedChange={(checked) => setIsAdmin(!!checked)}
        />
        <label htmlFor="isAdmin" className="text-sm font-medium leading-none">
          ¿Es administrador?
        </label>
      </div>

      {/* Tabla de permisos */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Tabla</TableHead>
              <TableHead
                className="text-center font-medium cursor-pointer hover:bg-muted/50 w-24"
                onClick={() => toggleColumn('can_create')}
                title="Invertir columna Crear"
              >
                Crear
              </TableHead>
              <TableHead
                className="text-center font-medium cursor-pointer hover:bg-muted/50 w-24"
                onClick={() => toggleColumn('can_read')}
                title="Invertir columna Leer"
              >
                Leer
              </TableHead>
              <TableHead
                className="text-center font-medium cursor-pointer hover:bg-muted/50 w-24"
                onClick={() => toggleColumn('can_update')}
                title="Invertir columna Actualizar"
              >
                Actualizar
              </TableHead>
              <TableHead
                className="text-center font-medium cursor-pointer hover:bg-muted/50 w-24"
                onClick={() => toggleColumn('can_delete')}
                title="Invertir columna Eliminar"
              >
                Eliminar
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map(table => (
              <TableRow key={table.id} className="hover:bg-muted/50">
                <TableCell
                  className="font-medium cursor-pointer py-3"
                  onClick={() => toggleRow(table.id)}
                  title="Invertir fila de esta tabla"
                >
                  <div>
                    <div className="font-medium text-sm">{table.name}</div>
                    {table.description && (
                      <div className="text-xs text-muted-foreground mt-1">{table.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center py-3">
                  <Checkbox
                    checked={permissions[table.id]?.can_create || false}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(table.id, 'can_create', checked)
                    }
                  />
                </TableCell>
                <TableCell className="text-center py-3">
                  <Checkbox
                    checked={permissions[table.id]?.can_read || false}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(table.id, 'can_read', checked)
                    }
                  />
                </TableCell>
                <TableCell className="text-center py-3">
                  <Checkbox
                    checked={permissions[table.id]?.can_update || false}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(table.id, 'can_update', checked)
                    }
                  />
                </TableCell>
                <TableCell className="text-center py-3">
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

      {/* Mensaje cuando no hay tablas */}
      {tables.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No hay tablas disponibles
        </div>
      )}

      {/* Barra de acciones */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={toggleAll}
          size="sm"
        >
          Seleccionar/Deseleccionar todo
        </Button>
        <Button
          onClick={savePermissions}
          disabled={saving}
          size="sm"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Permisos'}
        </Button>
      </div>

      {/* Modal de confirmación de éxito */}
      <ConfirmationDialog
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="¡Permisos guardados exitosamente!"
        message={`Los permisos para el rol "${selectedRole?.record_data?.nombre || selectedRole?.name || 'Rol'}" han sido actualizados correctamente.`}
        actions={[
          {
            label: "Aceptar",
            onClick: () => setShowSuccessModal(false),
            variant: "default"
          }
        ]}
      />

      {/* Estilos globales para aumentar z-index del modal de confirmación */}
      {showSuccessModal && (
        <style>{`
          [data-slot="dialog-overlay"] {
            z-index: 99999 !important;
          }
          [data-slot="dialog-content"] {
            z-index: 99999 !important;
          }
        `}</style>
      )}
    </div>
  );
};

export default PermissionsMatrix;

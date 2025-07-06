import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Save, AlertCircle } from 'lucide-react';
import { useAxiosAuth } from '@/hooks/useAxiosAuth';

const PermissionsMatrix = ({ selectedRole, onPermissionsChange }) => {
  const axios = useAxiosAuth();
  const [tables, setTables] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedRole) {
      loadTablesAndPermissions();
    }
  }, [selectedRole]);

  const loadTablesAndPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar todas las tablas
      const tablesRes = await axios.get('/tables');
      setTables(tablesRes.data || []);

      // Cargar permisos actuales del rol
      if (selectedRole) {
        const permsRes = await axios.get(`/permissions/role/${selectedRole.id}`);
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
      }
    } catch (err) {
      setError('Error al cargar tablas y permisos');
      console.error('Error loading tables and permissions:', err);
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

    setSaving(true);
    setError(null);
    try {
      // Use the bulk update endpoint
      await axios.post(`/permissions/role/${selectedRole.id}/bulk`, { permissions });
      
      // Notificar sobre el cambio
      if (onPermissionsChange) {
        onPermissionsChange();
      }
      
      // Opcional: mostrar mensaje de éxito
      console.log('Permisos guardados exitosamente');
      
    } catch (err) {
      setError('Error al guardar permisos');
      console.error('Error saving permissions:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!selectedRole) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">Selecciona un rol para gestionar sus permisos</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-500">Cargando permisos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Permisos para el rol: <Badge variant="outline">{selectedRole.name}</Badge>
          </CardTitle>
          <Button 
            onClick={savePermissions} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Permisos'}
          </Button>
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left font-medium">Tabla</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium">Crear</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium">Leer</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium">Actualizar</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {tables.map(table => (
                <tr key={table.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">
                    <div>
                      <div className="font-medium">{table.name}</div>
                      {table.description && (
                        <div className="text-sm text-gray-500">{table.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <Checkbox
                      checked={permissions[table.id]?.can_create || false}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(table.id, 'can_create', checked)
                      }
                    />
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <Checkbox
                      checked={permissions[table.id]?.can_read || false}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(table.id, 'can_read', checked)
                      }
                    />
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <Checkbox
                      checked={permissions[table.id]?.can_update || false}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(table.id, 'can_update', checked)
                      }
                    />
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <Checkbox
                      checked={permissions[table.id]?.can_delete || false}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(table.id, 'can_delete', checked)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tables.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No hay tablas disponibles
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PermissionsMatrix;

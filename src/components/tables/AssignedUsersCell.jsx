import React, { useState, useEffect } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, X, Edit3, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  getAssignedUsersByRecord, 
  setAssignedUsersForRecord 
} from '@/services/recordAssignedUsersService';
import { notifyAssignedUser } from '@/components/notifications/notifyAssignedUser';

export default function AssignedUsersCell({ 
  value = [], 
  onChange, 
  tableId, 
  recordId, 
  isEditing = false,
  className = ""
}) {
  const { users, loading: usersLoading } = useUsers();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignedUsersData, setAssignedUsersData] = useState([]);

  // Cargar usuarios asignados desde el backend
  useEffect(() => {
    if (recordId) {
      loadAssignedUsers();
    } else if (Array.isArray(value)) {
      setSelectedUsers(value);
      setTempSelectedUsers(value);
    }
  }, [recordId, value]);

  const loadAssignedUsers = async () => {
    try {
      setLoading(true);
      const assignedUsers = await getAssignedUsersByRecord(recordId);
      const userIds = assignedUsers.map(user => user.user_id);
      setSelectedUsers(userIds);
      setTempSelectedUsers(userIds);
      setAssignedUsersData(assignedUsers);
    } catch (error) {
      console.error('Error loading assigned users:', error);
      toast.error('Error al cargar usuarios asignados');
    } finally {
      setLoading(false);
    }
  };

  // Obtener información de los usuarios asignados
  const getAssignedUsers = () => {
    if (recordId && assignedUsersData.length > 0) {
      // Usar datos del backend que incluyen información completa del usuario
      return assignedUsersData;
    }
    
    if (!Array.isArray(selectedUsers) || selectedUsers.length === 0) {
      return [];
    }
    
    return selectedUsers.map(userId => {
      const user = users.find(u => u.id === userId);
      return user ? {
        user_id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url
      } : { 
        user_id: userId, 
        name: `Usuario ${userId}`, 
        email: '' 
      };
    });
  };

  // Manejar cambio en la selección temporal
  const handleUserToggle = (userId) => {
    setTempSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Confirmar cambios
  const handleConfirm = async () => {
    if (!recordId) {
      // Si no hay recordId, usar el onChange tradicional
      setSelectedUsers(tempSelectedUsers);
      if (onChange) {
        onChange(tempSelectedUsers);
      }
      setIsOpen(false);
      toast.success('Usuarios asignados actualizados');
      return;
    }

    try {
      setLoading(true);
      
      // Guardar en el backend
      await setAssignedUsersForRecord(recordId, tempSelectedUsers);
      
      // Identificar usuarios nuevos para notificar
      const newUsers = tempSelectedUsers.filter(userId => !selectedUsers.includes(userId));
      const removedUsers = selectedUsers.filter(userId => !tempSelectedUsers.includes(userId));
      
      // Notificar usuarios nuevos
      for (const userId of newUsers) {
        await notifyAssignedUser({
          userId,
          action: 'assigned',
          tableName: `Tabla ${tableId}`,
          recordId
        });
      }
      
      // Actualizar estado local
      setSelectedUsers(tempSelectedUsers);
      await loadAssignedUsers(); // Recargar datos del backend
      
      // Notificar cambio al componente padre
      if (onChange) {
        onChange(tempSelectedUsers);
      }
      
      setIsOpen(false);
      toast.success('Usuarios asignados actualizados');
      
    } catch (error) {
      console.error('Error updating assigned users:', error);
      toast.error('Error al actualizar usuarios asignados');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar cambios
  const handleCancel = () => {
    setTempSelectedUsers(selectedUsers);
    setIsOpen(false);
  };

  // Remover usuario específico
  const handleRemoveUser = async (userId) => {
    const newUsers = selectedUsers.filter(id => id !== userId);
    
    if (!recordId) {
      // Si no hay recordId, usar lógica tradicional
      setSelectedUsers(newUsers);
      setTempSelectedUsers(newUsers);
      if (onChange) {
        onChange(newUsers);
      }
      toast.success('Usuario removido');
      return;
    }

    try {
      setLoading(true);
      
      // Actualizar en el backend
      await setAssignedUsersForRecord(recordId, newUsers);
      
      // Actualizar estado local
      setSelectedUsers(newUsers);
      setTempSelectedUsers(newUsers);
      await loadAssignedUsers(); // Recargar datos del backend
      
      // Notificar cambio al componente padre
      if (onChange) {
        onChange(newUsers);
      }
      
      toast.success('Usuario removido');
      
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Error al remover usuario');
    } finally {
      setLoading(false);
    }
  };

  const assignedUsers = getAssignedUsers();

  return (
    <div className={`assigned-users-cell ${className}`}>
      {/* Mostrar usuarios asignados */}
      <div className="assigned-users-display">
        {loading ? (
          <div className="loading-indicator">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-xs text-gray-500">Cargando...</span>
          </div>
        ) : assignedUsers.length > 0 ? (
          <div className="users-list">
            {assignedUsers.slice(0, 2).map(user => (
              <div key={user.user_id} className="user-item">
                <div className="user-avatar">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="user-name">{user.name}</span>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUser(user.user_id)}
                    className="remove-btn"
                    disabled={loading}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            {assignedUsers.length > 2 && (
              <Badge variant="outline" className="more-users">
                +{assignedUsers.length - 2} más
              </Badge>
            )}
          </div>
        ) : (
          <div className="no-users">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Sin usuarios asignados</span>
          </div>
        )}
      </div>

      {/* Botón para editar (solo si está en modo edición) */}
      {isEditing && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="edit-btn"
              disabled={loading}
            >
              <Edit3 className="w-4 h-4" />
              Editar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Asignar Usuarios</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto">
                {usersLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Cargando usuarios...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={tempSelectedUsers.includes(user.id)}
                          onCheckedChange={() => handleUserToggle(user.id)}
                          disabled={loading}
                        />
                        <div className="flex items-center space-x-2 flex-1">
                          <div className="user-avatar-small">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirm} disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Confirmar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <style jsx>{`
        .assigned-users-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-height: 2rem;
        }

        .assigned-users-display {
          flex: 1;
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #6b7280;
        }

        .users-list {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .user-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          max-width: 120px;
        }

        .user-avatar {
          width: 1.5rem;
          height: 1.5rem;
          background: linear-gradient(135deg, #f3f4f6, #d1d5db); /* gris claro a gris */
          color: #374151; /* gris oscuro para la letra */
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.625rem;
          flex-shrink: 0;
        }

        .user-avatar-small {
          width: 1.25rem;
          height: 1.25rem;
          background: linear-gradient(135deg, #f3f4f6, #d1d5db);
          color: #374151;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.625rem;
          flex-shrink: 0;
        }

        .user-name {
          font-weight: 500;
          color: #374151;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 80px;
        }

        .remove-btn {
          padding: 0.125rem;
          height: auto;
          min-width: auto;
          color: #ef4444;
        }

        .remove-btn:hover {
          background: #fee2e2;
        }

        .more-users {
          font-size: 0.625rem;
          padding: 0.125rem 0.375rem;
          height: auto;
        }

        .no-users {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #6b7280;
          font-size: 0.75rem;
        }

        .edit-btn {
          padding: 0.25rem 0.5rem;
          height: auto;
          font-size: 0.75rem;
          gap: 0.25rem;
        }

        @media (max-width: 768px) {
          .user-item {
            max-width: 100px;
          }
          
          .user-name {
            max-width: 60px;
          }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, Search, X, UserCheck, UserX, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTableCollaborators } from '@/hooks/useTableCollaborators';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const TableCollaboratorsModal = ({ 
  open, 
  onOpenChange, 
  table,
  onCollaboratorsUpdated
}) => {
  const {
    collaborators,
    availableUsers,
    loading,
    error,
    assignCollaborators,
    removeCollaborator,
    refreshData
  } = useTableCollaborators(table?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showAssignedModal, setShowAssignedModal] = useState(false);

  // Filtrar usuarios disponibles
  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Usuarios que no son colaboradores
  const nonCollaborators = filteredUsers.filter(user => !user.is_collaborator);

  // Reset estados cuando se abre/cierra el modal
  useEffect(() => {
    if (open) {
      setSelectedUsers([]);
      setSearchTerm('');
    }
  }, [open]);

  // Manejar selección de usuarios
  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Seleccionar todos los usuarios visibles
  const handleSelectAll = () => {
    const allVisibleUserIds = nonCollaborators.map(user => user.id);
    const allSelected = allVisibleUserIds.every(id => selectedUsers.includes(id));
    
    if (allSelected) {
      // Deseleccionar todos los visibles
      setSelectedUsers(prev => prev.filter(id => !allVisibleUserIds.includes(id)));
    } else {
      // Seleccionar todos los visibles que no estén ya seleccionados
      setSelectedUsers(prev => [...new Set([...prev, ...allVisibleUserIds])]);
    }
  };

  // Asignar usuarios seleccionados
  const handleAssignUsers = async () => {
    if (selectedUsers.length === 0) return;

    setSaving(true);
    try {
      await assignCollaborators(selectedUsers);
      setSelectedUsers([]);
      if (onCollaboratorsUpdated) {
        onCollaboratorsUpdated();
      }
    } catch (error) {
      console.error('Error al asignar colaboradores:', error);
    } finally {
      setSaving(false);
    }
  };

  // Remover colaborador
  const handleRemoveCollaborator = async (userId) => {
    try {
      await removeCollaborator(userId);
      if (onCollaboratorsUpdated) {
        onCollaboratorsUpdated();
      }
    } catch (error) {
      console.error('Error al remover colaborador:', error);
    }
  };

  // Obtener iniciales para avatar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestionar Colaboradores
            {table && (
              <span className="text-base font-normal text-muted-foreground ml-2">
                - {table.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Header con información de colaboradores actuales */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {collaborators.length} colaborador(es) asignado(s)
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAssignedModal(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Ver Asignados
            </Button>
          </div>

          {/* Asignar nuevos colaboradores */}
          <div className="space-y-3">
            <h3 className="font-medium">Asignar Nuevos Colaboradores</h3>

            {/* Buscador */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuarios por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Controles de selección */}
            {nonCollaborators.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={nonCollaborators.length > 0 && nonCollaborators.every(user => selectedUsers.includes(user.id))}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    Seleccionar todos ({nonCollaborators.length} usuarios)
                  </span>
                </div>
                
                {selectedUsers.length > 0 && (
                  <Button
                    onClick={handleAssignUsers}
                    disabled={saving}
                    size="sm"
                  >
                    {saving ? 'Asignando...' : `Asignar ${selectedUsers.length} usuario(s)`}
                  </Button>
                )}
              </div>
            )}

            {/* Lista de usuarios disponibles */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Cargando usuarios...</p>
              </div>
            ) : nonCollaborators.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay usuarios disponibles para asignar</p>
                {searchTerm && (
                  <p className="text-sm mt-1">Intenta con una búsqueda diferente</p>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {nonCollaborators.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.includes(user.id)
                        ? 'border-gray-400 bg-gray-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="text-sm border p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>

        {/* Modal para ver usuarios asignados */}
        <AssignedUsersModal
          open={showAssignedModal}
          onOpenChange={setShowAssignedModal}
          collaborators={collaborators}
          tableName={table?.name}
          onRemoveCollaborator={handleRemoveCollaborator}
        />
      </DialogContent>
    </Dialog>
  );
};

// Componente separado para mostrar usuarios asignados
const AssignedUsersModal = ({ 
  open, 
  onOpenChange, 
  collaborators, 
  tableName,
  onRemoveCollaborator 
}) => {
  // Obtener iniciales para avatar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Colaboradores Asignados
            {tableName && (
              <span className="text-base font-normal text-muted-foreground ml-2">
                - {tableName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {collaborators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay colaboradores asignados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collaborator.user_avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(collaborator.user_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{collaborator.user_name}</p>
                      <p className="text-xs text-muted-foreground">{collaborator.user_email}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCollaborator(collaborator.user_id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableCollaboratorsModal;

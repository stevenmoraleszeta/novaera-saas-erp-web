import React, { useEffect, useState } from "react";
import { getUsers } from "@/services/usersService";
import { getAssignedUsersByRecord, setAssignedUsersForRecord } from "@/services/recordAssignedUsersService";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Search, X, UserCheck, UserX, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AssignedUsersModal from './AssignedUsersModal';

export default function AssignedUsersSelector({ 
  recordId, 
  onChange, 
  selectedUsers = [], 
  creationMode = false 
}) {
  const [users, setUsers] = useState([]);
  const [assigned, setAssigned] = useState(selectedUsers);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showAssignedModal, setShowAssignedModal] = useState(false);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  useEffect(() => {
    if (!creationMode && recordId) {
      getAssignedUsersByRecord(recordId).then((assignedData) => {
        console.log('Usuarios asignados recibidos:', assignedData);
        // El servicio puede devolver objetos con 'user_id' en lugar de 'id'
        // Normalizar los datos para que tengan la propiedad 'id'
        if (Array.isArray(assignedData)) {
          const normalizedData = assignedData.map(user => ({
            ...user,
            id: user.id || user.user_id // Usar 'id' si existe, sino 'user_id'
          }));
          setAssigned(normalizedData);
        } else {
          setAssigned([]);
        }
      }).catch(error => {
        console.error('Error cargando usuarios asignados:', error);
        setAssigned([]);
      });
    }
  }, [recordId, creationMode]);

  useEffect(() => {
    if (creationMode && Array.isArray(selectedUsers)) {
      // En modo creación, selectedUsers pueden ser IDs o objetos
      if (selectedUsers.length > 0 && typeof selectedUsers[0] === 'number') {
        // Si son IDs, buscar los objetos completos de usuario
        const assignedObjects = selectedUsers.map(id => 
          users.find(user => user.id === id)
        ).filter(Boolean);
        setAssigned(assignedObjects);
      } else {
        // Si ya son objetos, usarlos directamente
        setAssigned(selectedUsers);
      }
    }
  }, [selectedUsers, creationMode, users]);

  // Filtrar usuarios disponibles (excluir búsqueda)
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Usuarios que no están asignados (estos son los que se pueden asignar)
  const nonAssignedUsers = filteredUsers.filter(user => {
    // Verificar si el usuario ya está asignado
    const isAlreadyAssigned = assigned.some(assignedUser => {
      const assignedId = assignedUser.id || assignedUser.user_id || assignedUser;
      return assignedId === user.id;
    });
    
    // Debug: log para verificar el filtrado (solo cuando hay usuarios asignados)
    if (assigned.length > 0 && searchTerm === '') {
      console.log(`Usuario ${user.name} (ID: ${user.id}) - Ya asignado: ${isAlreadyAssigned}`);
    }
    
    return !isAlreadyAssigned;
  });

  // Obtener iniciales para avatar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Manejar selección de usuarios
  const handleUserToggle = (userId) => {
    setSelectedUsersToAdd(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Seleccionar todos los usuarios visibles
  const handleSelectAll = () => {
    const allVisibleUserIds = nonAssignedUsers.map(user => user.id);
    const allSelected = allVisibleUserIds.every(id => selectedUsersToAdd.includes(id));
    
    if (allSelected) {
      setSelectedUsersToAdd(prev => prev.filter(id => !allVisibleUserIds.includes(id)));
    } else {
      setSelectedUsersToAdd(prev => [...new Set([...prev, ...allVisibleUserIds])]);
    }
  };

  // Asignar usuarios seleccionados
  const handleAssignUsers = async () => {
    if (selectedUsersToAdd.length === 0) return;

    setSaving(true);
    try {
      const usersToAdd = users.filter(user => selectedUsersToAdd.includes(user.id));
      const updatedAssigned = [...assigned, ...usersToAdd];
      
      // Extraer IDs para el servicio
      const updatedIds = updatedAssigned.map(u => u.id || u.user_id || u);
      
      if (creationMode) {
        setAssigned(updatedAssigned);
        onChange?.(updatedIds);
      } else {
        await setAssignedUsersForRecord(recordId, updatedIds);
        // Recargar usuarios asignados desde el servidor para asegurar consistencia
        const refreshedUsers = await getAssignedUsersByRecord(recordId);
        const normalizedData = refreshedUsers.map(user => ({
          ...user,
          id: user.id || user.user_id
        }));
        setAssigned(normalizedData);
        onChange?.(updatedIds);
      }
      
      setSelectedUsersToAdd([]);
    } catch (error) {
      console.error('Error al asignar usuarios:', error);
    } finally {
      setSaving(false);
    }
  };

  // Remover usuario asignado
  const handleRemoveUser = async (userId) => {
    try {
      const updatedAssigned = assigned.filter(user => {
        const id = user.id || user.user_id || user;
        return id !== userId;
      });
      
      // Extraer IDs para el servicio
      const updatedIds = updatedAssigned.map(u => u.id || u.user_id || u);
      
      if (creationMode) {
        setAssigned(updatedAssigned);
        onChange?.(updatedIds);
      } else {
        await setAssignedUsersForRecord(recordId, updatedIds);
        // Recargar usuarios asignados desde el servidor para asegurar consistencia
        const refreshedUsers = await getAssignedUsersByRecord(recordId);
        const normalizedData = refreshedUsers.map(user => ({
          ...user,
          id: user.id || user.user_id
        }));
        setAssigned(normalizedData);
        onChange?.(updatedIds);
      }
    } catch (error) {
      console.error('Error al remover usuario:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Usuarios asignados actuales */}
      {assigned.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <h3 className="font-medium">Usuarios Asignados ({assigned.length})</h3>
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
        </div>
      )}

      {/* Asignar nuevos usuarios */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserX className="h-4 w-4" />
          <h3 className="font-medium">Asignar Nuevos Usuarios</h3>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Controles de selección */}
        {nonAssignedUsers.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={nonAssignedUsers.length > 0 && nonAssignedUsers.every(user => selectedUsersToAdd.includes(user.id))}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Seleccionar todos ({nonAssignedUsers.length} usuarios)
              </span>
            </div>
            
            {selectedUsersToAdd.length > 0 && (
              <Button
                onClick={handleAssignUsers}
                disabled={saving}
                size="sm"
              >
                {saving ? 'Asignando...' : `Asignar ${selectedUsersToAdd.length} usuario(s)`}
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
        ) : nonAssignedUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda.' : 'Todos los usuarios ya están asignados.'}
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {nonAssignedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => handleUserToggle(user.id)}
              >
                <Checkbox
                  checked={selectedUsersToAdd.includes(user.id)}
                  onChange={() => handleUserToggle(user.id)}
                />
                
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} />
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

      {/* Modal para ver usuarios asignados */}
      <AssignedUsersModal
        open={showAssignedModal}
        onOpenChange={setShowAssignedModal}
        assignedUsers={assigned}
        onRemoveUser={handleRemoveUser}
      />
    </div>
  );
}

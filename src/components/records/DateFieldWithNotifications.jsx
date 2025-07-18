import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Users, Settings, Plus, X } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import scheduledNotificationsService from '@/services/scheduledNotificationsService';
import { setAssignedUsersForRecord } from '@/services/recordAssignedUsersService';
import { toast } from 'sonner';

const DateFieldWithNotifications = ({ 
  // ...existing code...
  id, 
  value, 
  onChange, 
  className,
  type = "date",
  column,
  tableId,
  recordId,
  isEditing = false,
  pendingNotifications = [],
  onAddPendingNotification,
  onRemovePendingNotification,
  createdRecordId
}) => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    notify_before_days: 1,
    assigned_users: []
  });
  

  const { users } = useUsers();

  // Verificar si hay notificaciones pendientes para esta columna
  const columnPendingNotifications = pendingNotifications.filter(
    n => n.columnId === (column?.id ?? column?.column_id)
  );

  // Usuarios disponibles para asignar (no asignados aún)
  const availableUsers = users?.filter(
    (u) => !notificationData.assigned_users.includes(u.id)
  ) || [];

  // Agregar usuario a la notificación
  const handleAddUser = (userId) => {
    setNotificationData((prev) => ({
      ...prev,
      assigned_users: [...prev.assigned_users, parseInt(userId)]
    }));
  };

  // Quitar usuario de la notificación
  const handleRemoveUser = (userId) => {
    setNotificationData((prev) => ({
      ...prev,
      assigned_users: prev.assigned_users.filter((id) => id !== userId)
    }));
  };

  // Función para crear notificación
  const handleCreateNotification = async () => {
     console.log("Creando notificación...");
    // Combinar fecha y hora en un solo string ISO
    let targetDate = '';
    if (notificationData.date && notificationData.time) {
      targetDate = new Date(`${notificationData.date}T${notificationData.time}`).toISOString();
    } else if (value) {
      targetDate = new Date(value).toISOString();
    }
    if (recordId) {
      // Registro existente: crear notificación inmediatamente
      console.log('Datos de notificación:', {
        tableId,
        recordId,
        columnId: column?.id ?? column?.column_id,
        targetDate,
        title: notificationData.title,
        message: notificationData.message,
        notify_before_days: notificationData.notify_before_days,
        assigned_users: notificationData.assigned_users
      });

      try {
        await scheduledNotificationsService.createScheduledNotification({
          table_id: parseInt(tableId),
          record_id: parseInt(recordId),
          column_id: column?.id ?? column?.column_id,
          target_date: targetDate,
          notification_title: notificationData.title || `Recordatorio: ${column.name}`,
          notification_message: notificationData.message || `Recordatorio para la fecha: ${targetDate}`,
          notify_before_days: notificationData.notify_before_days,
          assigned_users: notificationData.assigned_users
        });
        // Si hay usuarios asignados, también asignarlos al registro
        if (notificationData.assigned_users.length > 0) {
          await setAssignedUsersForRecord(recordId, notificationData.assigned_users);
        }
        toast.success('Notificación creada exitosamente');
        setShowNotificationModal(false);
        setNotificationData({
          title: '',
          message: '',
          notify_before_days: 1,
          assigned_users: [],
          date: '',
          time: ''
        });
      } catch (error) {
        console.error('Error creating notification:', error);
        toast.error('Error al crear la notificación');
      }
    } else {
      // Registro nuevo: agregar a notificaciones pendientes
      if (onAddPendingNotification && value) {
        onAddPendingNotification(
          column?.id ?? column?.column_id,
          targetDate,
          notificationData.title || `Recordatorio: ${column.name}`,
          notificationData.message || `Recordatorio para la fecha: ${targetDate}`,
          notificationData.notify_before_days,
          notificationData.assigned_users
        );
        toast.success('Notificación programada para cuando se guarde el registro');
        setShowNotificationModal(false);
        setNotificationData({
          title: '',
          message: '',
          notify_before_days: 1,
          assigned_users: [],
          date: '',
          time: ''
        });
      }
    }
  };

  // ...existing code...
  return (
    <>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={className}
      />
      {value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowNotificationModal(true)}
          disabled={!value}
          className="flex items-center gap-1"
        >
          <Bell size={14} />
          <span className="hidden sm:inline">Notificar</span>
        </Button>
      )}

      {showNotificationModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[5000]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowNotificationModal(false);
            }
          }}
        >
          <Card
            className="w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} />
                  Crear Notificación
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotificationModal(false)}
                >
                  <X size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Título de la notificación
                </label>
                <Input
                  value={notificationData.title}
                  onChange={(e) =>
                    setNotificationData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Ej: Recordatorio de fecha importante"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Mensaje
                </label>
                <textarea
                  className="w-full p-2 border rounded-md resize-none"
                  rows={3}
                  value={notificationData.message}
                  onChange={(e) =>
                    setNotificationData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  placeholder="Describe el recordatorio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha de notificación
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md mb-2"
                  value={notificationData.date || value?.slice(0, 10) || ""}
                  onChange={(e) =>
                    setNotificationData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
                <label className="block text-sm font-medium mb-1">
                  Hora de notificación
                </label>
                <input
                  type="time"
                  className="w-full p-2 border rounded-md"
                  value={notificationData.time || value?.slice(11, 16) || ""}
                  onChange={(e) =>
                    setNotificationData((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                />
                <small className="text-xs text-gray-500">
                  Por defecto se usa la fecha y hora del registro, pero puedes
                  cambiarlas.
                </small>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Notificar con días de anticipación
                </label>
                <Input
                  type="number"
                  min="0"
                  max="365"
                  value={notificationData.notify_before_days}
                  onChange={(e) =>
                    setNotificationData((prev) => ({
                      ...prev,
                      notify_before_days: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Asignar a usuarios
                </label>

                {notificationData.assigned_users.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {notificationData.assigned_users.map((userId) => {
                      const user = users?.find((u) => u.id === userId);
                      return (
                        <div
                          key={userId}
                          className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-md"
                        >
                          <span className="text-sm font-medium">
                            {user?.name ||
                              user?.username ||
                              `Usuario ${userId}`}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUser(userId)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {availableUsers.length > 0 && (
                  <div>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddUser(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        {notificationData.assigned_users.length === 0
                          ? "Seleccionar usuario..."
                          : "Agregar otro usuario..."}
                      </option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name || user.username}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {availableUsers.length === 0 &&
                  notificationData.assigned_users.length > 0 && (
                    <p className="text-xs text-gray-500 italic">
                      Todos los usuarios han sido asignados
                    </p>
                  )}
              </div>

              <div className="flex gap-2 pt-4">
               <Button
                type="button"
                onClick={handleCreateNotification}
                disabled={
                  !notificationData.title ||
                  (!notificationData.date && !value)
                }
                className="flex-1"
              >
                Crear Notificación
              </Button>

              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
export default DateFieldWithNotifications;

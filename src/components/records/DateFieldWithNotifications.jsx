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
    assigned_users: [],
    date: '',
    time: ''
  });
  
  const { users } = useUsers();

  // Función para formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      let date;
      
      // Si viene en formato "YYYY-MM-DD HH:MM:SS", parsearlo manualmente
      if (dateString.includes(' ') && !dateString.includes('T')) {
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');
        
        return `${day}/${month}/${year} a las ${hours}:${minutes}`;
      } else {
        // Para otros formatos, usar Date pero con cuidado
        date = new Date(dateString);
        
        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
          return dateString;
        }
        
        // Formatear fecha
        const dateOptions = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        };
        const formattedDate = date.toLocaleDateString('es-ES', dateOptions);
        
        // Formatear hora
        const timeOptions = {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false // formato 24 horas
        };
        const formattedTime = date.toLocaleTimeString('es-ES', timeOptions);
        
        return `${formattedDate} a las ${formattedTime}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

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
    
    // Combinar fecha y hora en formato correcto sin conversión de zona horaria
    let targetDate = '';
    
    // Determinar la fecha a usar
    let dateToUse = notificationData.date;
    if (!dateToUse && value) {
      if (type === 'datetime-local' || type === 'datetime') {
        // Si es datetime-local, el value viene como "YYYY-MM-DDTHH:MM"
        if (value.includes('T')) {
          dateToUse = value.split('T')[0];
        } else {
          // Si viene en otro formato, parsearlo manualmente
          const date = new Date(value);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          dateToUse = `${year}-${month}-${day}`;
        }
      } else {
        // Para tipo date
        dateToUse = value;
      }
    }
    
    // Determinar la hora a usar
    let timeToUse = notificationData.time;
    if (!timeToUse && value) {
      if (type === 'datetime-local' || type === 'datetime') {
        // Si es datetime-local, el value viene como "YYYY-MM-DDTHH:MM"
        if (value.includes('T')) {
          timeToUse = value.split('T')[1];
        } else {
          // Si viene en otro formato, parsearlo manualmente
          const date = new Date(value);
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          timeToUse = `${hours}:${minutes}`;
        }
      } else {
        // Para tipo date, usar hora por defecto solo si no hay hora especificada
        timeToUse = "09:00";
      }
    }
    
    // Combinar fecha y hora
    if (dateToUse && timeToUse) {
      targetDate = `${dateToUse} ${timeToUse}:00`;
    }
    
    console.log('Debug - Valores usados:', {
      'notificationData.date': notificationData.date,
      'notificationData.time': notificationData.time,
      'value': value,
      'dateToUse': dateToUse,
      'timeToUse': timeToUse,
      'targetDate': targetDate
    });

    if (recordId) {
      // Registro existente: crear notificación inmediatamente
      console.log('Datos de notificación:', {
        tableId,
        recordId,
        columnId: column?.id ?? column?.column_id,
        targetDate,
        title: notificationData.title,
        message: notificationData.message,
        assigned_users: notificationData.assigned_users
      });

      try {
        await scheduledNotificationsService.createScheduledNotification({
          table_id: parseInt(tableId),
          record_id: parseInt(recordId),
          column_id: column?.id ?? column?.column_id,
          target_date: targetDate,
          notification_title: notificationData.title || `Recordatorio: ${column.name}`,
          notification_message: notificationData.message || `Recordatorio para la fecha: ${formatDateTime(targetDate)}`,
          notify_before_days: 0, // Siempre 0 ya que quitamos la opción
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
      if (onAddPendingNotification && (value || (notificationData.date && notificationData.time))) {
        onAddPendingNotification(
          column?.id ?? column?.column_id,
          targetDate,
          notificationData.title || `Recordatorio: ${column.name}`,
          notificationData.message || `Recordatorio para la fecha: ${formatDateTime(targetDate)}`,
          0, // notify_before_days siempre 0
          notificationData.assigned_users
        );
        
        toast.success('Notificación programada para cuando se guarde el registro');
        setShowNotificationModal(false);
        setNotificationData({
          title: '',
          message: '',
          assigned_users: [],
          date: '',
          time: ''
        });
      }
    }
  };

  return (
    <>
      {/* Input y botón juntos en flex */}
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className={className}
        />
        {(value || (notificationData.date && notificationData.time)) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowNotificationModal(true)}
            className="flex items-center gap-1 border-0"
          >
            <Bell size={14} />
          </Button>
        )}
      </div>
      {/* Mostrar badge si hay notificaciones pendientes */}
      {columnPendingNotifications.length > 0 && (
        <Badge variant="secondary" className="ml-2">
          {columnPendingNotifications.length} notificación(es) pendiente(s)
        </Badge>
      )}

      {showNotificationModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center pt-30 z-[5000] px-4 py-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowNotificationModal(false);
            }
          }}
        >
          <Card
            className="w-full max-w-md max-h-[75vh] overflow-y-auto"
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
                  value={notificationData.time || value?.slice(11, 16) || "09:00"}
                  onChange={(e) =>
                    setNotificationData((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                />
                <small className="text-xs text-gray-500">
                  Por defecto se usa la fecha del campo, pero puedes cambiarla.
                </small>
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
                  {recordId ? 'Crear Notificación' : 'Programar Notificación'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default DateFieldWithNotifications;

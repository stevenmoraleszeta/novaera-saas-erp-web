import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import scheduledNotificationsService from '@/services/scheduledNotificationsService';
import useUserStore from '@/stores/userStore';
import { useRouter } from 'next/navigation';

const NotificationDropdown = () => {
  const user = useUserStore(state => state.user);
  const company = useUserStore(state => state.company);
  const companyCode = company?.company_code || company?.code;
  const userId = user?.id;
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Función para formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
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
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Poll notifications every 30s
  useEffect(() => {
    if (!userId || !companyCode) return;
    // limpiar al cambiar de empresa
    setNotifications([]);
    let interval;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Programadas (fun no requiere userId explícito)
        const scheduled = await scheduledNotificationsService.getUserScheduledNotifications();
        const general = await scheduledNotificationsService.getUserGeneralNotifications(userId);
        const currentUserEmail = user?.email;
        const filterFn = (n) => {
          if (!n) return false;
            if (n.is_active === false) return false;
            if (n.read === true) return false;
            // Asegurar pertenencia: user_id o email coinciden
            if (n.user_id && n.user_id !== userId) return false;
            if (n.email && currentUserEmail && n.email !== currentUserEmail) return false;
            return true;
        };
        const unreadGeneral = (general.data || general || []).filter(filterFn);
        const unreadScheduled = (scheduled.data || scheduled || []).filter(filterFn);
        setNotifications([...unreadScheduled, ...unreadGeneral]);
      } catch (e) {
        console.error('Error cargando notificaciones dropdown:', e);
        setNotifications([]);
      }
      setLoading(false);
    };
    fetchNotifications();
    interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, companyCode]);

  // Marcar como leída
  const markAsRead = async (notificationId) => {
    try {
      // Buscar la notificación en la lista local para saber su tipo
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;
      if (notification.notification_title || notification.target_date) {
        // Es una scheduled notification
        await scheduledNotificationsService.markNotificationAsRead(notificationId);
      } else {
        // Es una general notification
        await scheduledNotificationsService.markGeneralNotificationAsRead(notificationId);
      }
      // Eliminar la notificación del dropdown
      setNotifications(notifications => notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Todas las notificaciones son no leídas (ya filtradas en el backend)
  const unreadNotifications = notifications;

  return (
    <div className="relative">
      <Button
        variant={open ? "default" : "ghost"}
        size="icon"
        onClick={() => setOpen(!open)}
        className={`relative ${open ? "bg-black" : ""}`}
        aria-label="Ver notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadNotifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadNotifications.length}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="p-2 border-b font-semibold flex justify-between items-center">
            <span>Notificaciones</span>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Cargando...</div>
            ) : unreadNotifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">Sin notificaciones</div>
            ) : (
              unreadNotifications.map(n => (
                <div key={n.id} className="flex items-start gap-2 p-3 border-b last:border-b-0 hover:bg-muted/30">
                  <Bell className="h-4 w-4 mt-1 text-green-500" />
                  <div className="flex-1">
                    <div className="font-medium flex flex-wrap gap-1 items-center">
                      {n.notification_title || n.title}
                      {(n.link_to_module || n.table_id || n.module_id) && (
                        <div className="ml-2 flex gap-1">
                          {/* Botón para ir al módulo */}
                          <button
                            className="text-xs text-blue-600 hover:underline"
                            onClick={() => {
                              setOpen(false);
                              if (n.module_id) {
                                router.push(`/modulos/${n.module_id}`);
                              } else if (n.table_id) {
                                router.push(`/modulos/${n.table_id}`);
                              } else if (n.link_to_module) {
                                router.push(n.link_to_module);
                              }
                            }}
                          >
                            Ver módulo
                          </button>
                          
                          {/* Botón para ir al registro específico (solo si hay record_id) */}
                          {n.record_id && (
                            <>
                              <span className="text-xs text-gray-400">|</span>
                              <button
                                className="text-xs text-green-600 hover:underline"
                                onClick={() => {
                                  setOpen(false);
                                  if (n.module_id && n.record_id) {
                                    router.push(`/modulos/${n.module_id}?openRecord=${n.record_id}`);
                                  } else if (n.table_id && n.record_id) {
                                    router.push(`/modulos/${n.table_id}?openRecord=${n.record_id}`);
                                  }
                                }}
                              >
                                Ver registro
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{n.notification_message || n.message}</div>
                    {n.target_date && (
                      <div className="text-xs mt-1 text-blue-600 font-medium">
                        {formatDateTime(n.target_date)}
                      </div>
                    )}
                  </div>
                  <label className="ml-2 flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => markAsRead(n.id)}
                      className="accent-blue-600 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                      title="Marcar como leída"
                    />
                    <span className="text-xs text-blue-600">Leída</span>
                  </label>
                </div>
              ))
            )}
          </div>
          
          <div className="border-t border-gray-200 p-3 text-center">
            <button
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => {
                setOpen(false);
                router.push('/notifications');
              }}
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import scheduledNotificationsService from '@/services/scheduledNotificationsService';
import useUserStore from '@/stores/userStore';
import { useRouter } from 'next/navigation';

const NotificationDropdown = () => {
  const user = useUserStore(state => state.user);
  const userId = user?.id;
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Poll notifications every 30s
  useEffect(() => {
    if (!userId) return;
    let interval;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Solo obtener notificaciones programadas del usuario (ya filtradas como no leídas)
        const res = await scheduledNotificationsService.getUserScheduledNotifications();
        console.log('Notificaciones dropdown:', res);
        setNotifications(res.data || res || []);
      } catch (e) {
        console.error('Error cargando notificaciones dropdown:', e);
        setNotifications([]);
      }
      setLoading(false);
    };
    fetchNotifications();
    interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Marcar como leída
  const markAsRead = async (notificationId) => {
    try {
      await scheduledNotificationsService.markNotificationAsRead(notificationId);
      // Remover la notificación de la lista local
      setNotifications(notifications => notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Todas las notificaciones son no leídas (ya filtradas en el backend)
  const unreadNotifications = notifications;

  return (
    <div className="relative">
      <button
        className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted p-0"
        onClick={() => setOpen(!open)}
        aria-label="Ver notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadNotifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadNotifications.length}
          </span>
        )}
      </button>
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
                      {n.table_name && (
                        <>
                          <span className="ml-1 text-xs text-gray-500">[{n.table_name}]</span>
                          <button
                            className="ml-1 text-xs text-blue-600 hover:underline"
                            onClick={() => {
                              setOpen(false);
                              router.push(`/tablas/${n.table_id}`);
                            }}
                          >
                            Ver tabla
                          </button>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{n.notification_message || n.message}</div>
                    {n.target_date && (
                      <div className="text-xs mt-1">Para: {n.target_date?.slice(0, 10)}</div>
                    )}
                  </div>
                  <button
                    className="ml-2 text-xs text-blue-600 hover:underline"
                    onClick={() => markAsRead(n.id)}
                  >
                    Marcar como leída
                  </button>
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

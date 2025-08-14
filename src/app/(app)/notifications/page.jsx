'use client';

import React, { useEffect, useState } from 'react';
import scheduledNotificationsService from '@/services/scheduledNotificationsService';
import useUserStore from '@/stores/userStore';
import { Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const NotificacionesPage = () => {
  const user = useUserStore(state => state.user);
  const userId = user?.id;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Función para cargar notificaciones
  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await scheduledNotificationsService.getAllUserNotifications(userId);
      const all = res.data || res || [];
      const currentUserEmail = user?.email;
      const filtered = all.filter(n => {
        if (!n) return false;
        if (n.is_active === false) return false;
        if (n.user_id && n.user_id !== userId) return false;
        if (n.email && currentUserEmail && n.email !== currentUserEmail) return false;
        return true;
      });
      setNotifications(filtered);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setNotifications([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) return;
    fetchAll();
    // eslint-disable-next-line
  }, [userId]);

  // Eliminar una notificación (scheduled o normal) usando los nuevos endpoints
  const handleDeleteNotification = async (notif) => {
    try {
      if (notif.type === 'scheduled' || notif.notification_title) {
        // Es scheduled notification
        await scheduledNotificationsService.deactivateScheduledNotification(notif.id);
      } else {
        // Es general notification
        await scheduledNotificationsService.deactivateGeneralNotification(notif.id);
      }
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  // Vaciar todas las notificaciones usando el endpoint global
  const handleClearAll = async () => {
    setLoading(true);
    try {
      await scheduledNotificationsService.deactivateAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Error al vaciar notificaciones:', error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Todas tus notificaciones programadas</h1>
        {notifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={loading}
            title="Vaciar todas las notificaciones"
          >
            Vaciar todo
          </Button>
        )}
      </div>
      {loading ? (
        <div className="p-4 text-center text-gray-500">Cargando...</div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No tienes notificaciones</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, idx) => {
            // Si hay ids duplicados, usa una key compuesta
            const key = `${n.id}-${n.created_at || idx}`;
            return (
              <div key={key} className={`flex items-start gap-2 p-4 rounded-md border ${
                n.read ? 'border-gray-200 bg-gray-50' : 'border-green-200 bg-green-50'
              }`}>
                <Bell className={`h-5 w-5 mt-1 ${
                  n.read ? 'text-gray-400' : 'text-green-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Programada
                    </span>
                    {n.read && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        Leída
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    {n.notification_title || n.title}
                    {n.table_id && (
                      <button
                        className="ml-2 text-xs text-blue-600 hover:underline"
                        onClick={() => router.push(`${n.link_to_module}`)}
                      >
                        Ver módulo
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{n.notification_message || n.message}</div>
                  <div className="text-xs mt-2 text-gray-400">
                    Para: {n.target_date?.slice(0, 10)} | 
                    Creada: {new Date(n.created_at).toLocaleString()}
                  </div>
                  {n.notification_sent && (
                    <span className="text-xs text-green-600 mt-1 block">✓ Enviada</span>
                  )}
                </div>
                {/* Botón para eliminar notificación (ícono de basurero) */}
                <button
                  className="ml-2 p-1 rounded text-black hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Eliminar notificación"
                  onClick={() => handleDeleteNotification(n)}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificacionesPage;

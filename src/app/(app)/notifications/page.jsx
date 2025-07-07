'use client';

import React, { useEffect, useState } from 'react';
import scheduledNotificationsService from '@/services/scheduledNotificationsService';
import useUserStore from '@/stores/userStore';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

const NotificacionesPage = () => {
  const user = useUserStore(state => state.user);
  const userId = user?.id;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Solo obtener notificaciones programadas (todas, no solo las no leídas)
        const res = await scheduledNotificationsService.getNotificationsByUser(userId);
        setNotifications(res.data || []);
      } catch {
        setNotifications([]);
      }
      setLoading(false);
    };
    fetchAll();
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Todas tus notificaciones programadas</h1>
      {loading ? (
        <div className="p-4 text-center text-gray-500">Cargando...</div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No tienes notificaciones</div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`flex items-start gap-2 p-4 rounded-md border ${
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
                <div className="font-medium text-gray-900">
                  {n.notification_title || n.title}
                  {n.table_name && (
                    <>
                      <span className="ml-1 text-xs text-gray-500">[{n.table_name}]</span>
                      <button
                        className="ml-1 text-xs text-blue-600 hover:underline"
                        onClick={() => router.push(`/tablas/${n.table_id}`)}
                      >
                        Ver tabla
                      </button>
                    </>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificacionesPage;

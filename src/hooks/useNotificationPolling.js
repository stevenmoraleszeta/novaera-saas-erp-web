import React, { useContext, useState, useEffect } from 'react';
import { countUnread } from '@/services/notificationService';
import { AuthContext } from '../context/AuthContext';

export function useNotificationPolling(userId, fetchNotifications, fetchUnreadCount, interval = 3000) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(AuthContext);


  useEffect(() => {
    let isMounted = true;
    let pollingInterval;

    const fetchUnreadCount2 = async () => {
      if (!userId) return;
      fetchNotifications();
      fetchUnreadCount()

      try {
        const count = await countUnread(userId);
        if (isMounted) {
          setUnreadCount(count);
        }
      } catch (err) {
        console.error('Error al obtener el conteo de notificaciones no leídas:', err);
      }
    };


    fetchUnreadCount2();
    

    pollingInterval = setInterval(fetchUnreadCount2, interval); // Polling periódico

    return () => {
      isMounted = false;
      clearInterval(pollingInterval);
    };
  }, [userId, interval]);

  return unreadCount;
}

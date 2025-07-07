import React, { useState, useEffect } from 'react';
import { Bell, Clock, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import scheduledNotificationsService from '@/services/scheduledNotificationsService';
import useUserStore from '@/stores/userStore';

const RecordNotificationsPanel = ({ tableId, recordId }) => {
  const user = useUserStore(state => state.user);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tableId && recordId) {
      fetchNotifications();
    }
  }, [tableId, recordId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await scheduledNotificationsService.getScheduledNotifications(tableId, recordId);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones del Registro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Cargando notificaciones...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones del Registro
          {notifications.length > 0 && (
            <Badge variant="secondary">{notifications.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No hay notificaciones programadas para este registro
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border rounded-lg ${
                  notification.notification_sent 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                   
                    
                    <p className="text-xs text-gray-600 mb-2">
                      {notification.notification_message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Fecha objetivo: {formatDate(notification.target_date)}
                      </div>
                      
                      {notification.notify_before_days > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {notification.notify_before_days} días antes
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {notification.assigned_user_names?.length || 0} usuarios
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mt-1">
                      Columna: {notification.column_name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecordNotificationsPanel;

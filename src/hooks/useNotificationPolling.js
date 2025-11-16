import { useState, useEffect, useCallback } from "react";
import {
  getNotificationsByUser,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  countUnread,
} from "@/services/notificationService";

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [search, setSearch] = useState("");

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await getNotificationsByUser(userId);
      const filtered = search
        ? response.filter(
            (n) =>
              n.title.toLowerCase().includes(search.toLowerCase()) ||
              n.message.toLowerCase().includes(search.toLowerCase())
          )
        : response;

      setNotifications(filtered);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err?.response?.data?.error || "Error al cargar notificaciones");
    } finally {
      setLoading(false);
    }
  }, [userId, search]);

  const fetchUnreadCount = useCallback(async () => {
    console.log("TRY FETCH");
    if (!userId) return;
    try {
      const count = await countUnread(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const handleCreate = async (data) => {
    try {
      setError(null);
      await createNotification(data);
      setSuccess("Notificación creada");
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error creating notification:", err);
      setError(err?.response?.data?.error || "Error al crear notificación");
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(userId, notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(userId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(userId, notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications(userId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error deleting all notifications:", err);
    }
  };

  const handleSearch = (query) => {
    setSearch(query);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    success,
    handleCreate,
    handleSearch,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    handleDeleteAll,
    fetchNotifications,
    fetchUnreadCount,
    clearMessages,
  };
}

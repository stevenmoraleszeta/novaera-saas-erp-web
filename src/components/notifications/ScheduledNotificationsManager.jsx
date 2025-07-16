import React, { useState, useEffect } from 'react';
import useScheduledNotifications from '../../hooks/useScheduledNotifications';
import { useUsers } from '../../hooks/useUsers';
import ScheduledNotificationForm from './ScheduledNotificationForm';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
import { toast } from 'sonner';
import { PiBell, PiCalendar, PiUsers, PiPlus, PiPencil, PiTrash, PiEye } from 'react-icons/pi';

const ScheduledNotificationsManager = ({ tableId = null, recordId = null }) => {
  const { 
    notifications, 
    loading, 
    error, 
    deleteNotification, 
    loadNotifications 
  } = useScheduledNotifications(tableId);
  
  const { users } = useUsers();
  
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCreateNew = () => {
    setEditingNotification(null);
    setShowForm(true);
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setShowForm(true);
  };

  const handleDelete = (notification) => {
    setNotificationToDelete(notification);
    setShowDeleteModal(true);
  };

  const handleViewDetail = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  // Función para obtener los nombres de los usuarios asignados
  const getAssignedUserNames = (assignedUserIds) => {
    if (!assignedUserIds || assignedUserIds.length === 0) {
      return 'Ningún usuario asignado';
    }
    
    const userNames = assignedUserIds.map(userId => {
      const user = users.find(u => u.id === userId);
      return user ? user.username : `Usuario ${userId}`;
    });
    
    return userNames.join(', ');
  };

  const confirmDelete = async () => {
    if (notificationToDelete) {
      try {
        await deleteNotification(notificationToDelete.id);
        toast.success('Notificación eliminada exitosamente');
        setShowDeleteModal(false);
        setNotificationToDelete(null);
      } catch (error) {
        console.error('Error deleting notification:', error);
        toast.error('Error al eliminar la notificación');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingNotification(null);
    loadNotifications();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (notification) => {
    const now = new Date();
    const targetDate = new Date(notification.target_date);
    
    if (notification.notification_sent) {
      return <span className="badge badge-success">Enviada</span>;
    }
    
    if (targetDate < now) {
      return <span className="badge badge-warning">Vencida</span>;
    }
    
    if (notification.reminder_sent) {
      return <span className="badge badge-info">Recordatorio Enviado</span>;
    }
    
    return <span className="badge badge-primary">Programada</span>;
  };

  const columns = [
    {
      key: 'notification_title',
      header: 'Título',
      render: (value) => (
        <span className="notification-title">{value}</span>
      )
    },
    {
      key: 'target_date',
      header: 'Fecha Objetivo',
      render: (value) => formatDate(value)
    },
    {
      key: 'column_name',
      header: 'Columna',
      render: (value) => (
        <span className="column-name">{value}</span>
      )
    },
    {
      key: 'assigned_users',
      header: 'Usuarios Asignados',
      render: (value) => (
        <div className="assigned-users-cell">
          <PiUsers className="icon" />
          <span title={getAssignedUserNames(value)}>
            {value && value.length > 0 
              ? (value.length === 1 
                  ? getAssignedUserNames(value)
                  : `${getAssignedUserNames(value.slice(0, 2))}${value.length > 2 ? ` +${value.length - 2} más` : ''}`)
              : 'Ningún usuario asignado'
            }
          </span>
        </div>
      )
    },
    {
      key: 'notify_before_days',
      header: 'Días Antes',
      render: (value) => `${value} días`
    },
    {
      key: 'status',
      header: 'Estado',
      render: (_, notification) => getStatusBadge(notification)
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (_, notification) => (
        <div className="actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetail(notification)}
            title="Ver detalles"
          >
            <PiEye />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(notification)}
            title="Editar"
          >
            <PiPencil />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(notification)}
            title="Eliminar"
            className="danger"
          >
            <PiTrash />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="scheduled-notifications-manager">
      <div className="header">
        <h2>
          <PiBell className="icon" />
          Notificaciones Programadas
        </h2>
        <Button
          variant="primary"
          onClick={handleCreateNew}
          disabled={!tableId || !recordId}
        >
          <PiPlus className="icon" />
          Nueva Notificación
        </Button>
      </div>

      {loading && (
        <div className="loading">
          Cargando notificaciones...
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="empty-state">
          <PiCalendar className="icon large" />
          <h3>No hay notificaciones programadas</h3>
          <p>Crea una nueva notificación para empezar a programar recordatorios.</p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <Table
          columns={columns}
          data={notifications}
          onRowClick={handleViewDetail}
        />
      )}

      {/* Formulario para crear/editar */}
      <ScheduledNotificationForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        tableId={tableId}
        recordId={recordId}
        initialData={editingNotification}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
        size="small"
      >
        <div className="delete-confirmation">
          <p>¿Estás seguro de que deseas eliminar esta notificación programada?</p>
          <p><strong>{notificationToDelete?.notification_title}</strong></p>
          <div className="actions">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalles de la Notificación"
        size="medium"
      >
        {selectedNotification && (
          <div className="notification-detail">
            <div className="detail-section">
              <h4>Información General</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Título:</label>
                  <span>{selectedNotification.notification_title}</span>
                </div>
                <div className="detail-item">
                  <label>Fecha Objetio:</label>
                  <span>{formatDate(selectedNotification.target_date)}</span>
                </div>
                <div className="detail-item">
                  <label>Columna:</label>
                  <span>{selectedNotification.column_name}</span>
                </div>
                <div className="detail-item">
                  <label>Días de Anticipación:</label>
                  <span>{selectedNotification.notify_before_days} días</span>
                </div>
              </div>
            </div>

            {selectedNotification.notification_message && (
              <div className="detail-section">
                <h4>Mensaje</h4>
                <p>{selectedNotification.notification_message}</p>
              </div>
            )}

            <div className="detail-section">
              <h4>Estado</h4>
              {getStatusBadge(selectedNotification)}
            </div>

            <div className="detail-section">
              <h4>Usuarios Asignados</h4>
              <div className="assigned-users">
                {selectedNotification.assigned_users && selectedNotification.assigned_users.length > 0 
                  ? (
                    <div className="user-list">
                      {selectedNotification.assigned_users.map(userId => {
                        const user = users.find(u => u.id === userId);
                        return (
                          <div key={userId} className="user-item">
                            <PiUsers className="user-icon" />
                            <span>{user ? user.username : `Usuario ${userId}`}</span>
                          </div>
                        );
                      })}
                    </div>
                  )
                  : 'Ningún usuario asignado'
                }
              </div>
            </div>

            <div className="detail-section">
              <h4>Fechas</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Creada:</label>
                  <span>{formatDate(selectedNotification.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .scheduled-notifications-manager {
          padding: 1rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .header h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          color: #374151;
        }

        .icon {
          width: 1.2rem;
          height: 1.2rem;
        }

        .icon.large {
          width: 3rem;
          height: 3rem;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .empty-state .icon {
          color: #d1d5db;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: #374151;
        }

        .empty-state p {
          margin: 0;
        }

        .notification-title {
          font-weight: 500;
          color: #374151;
        }

        .column-name {
          font-family: monospace;
          font-size: 0.875rem;
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }

        .user-count {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #6b7280;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-success {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-info {
          background: #dbeafe;
          color: #1e40af;
        }

        .badge-primary {
          background: #e0e7ff;
          color: #3730a3;
        }

        .actions {
          display: flex;
          gap: 0.25rem;
        }

        .actions :global(.danger) {
          color: #dc2626;
        }

        .actions :global(.danger:hover) {
          color: #b91c1c;
          background: #fee2e2;
        }

        .delete-confirmation {
          padding: 1rem;
          text-align: center;
        }

        .delete-confirmation p {
          margin-bottom: 1rem;
        }

        .delete-confirmation .actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .notification-detail {
          padding: 1rem;
        }

        .detail-section {
          margin-bottom: 1.5rem;
        }

        .detail-section h4 {
          margin: 0 0 0.75rem 0;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-item span {
          color: #374151;
        }

        .assigned-users {
          color: #6b7280;
          font-style: italic;
        }

        .assigned-users-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .assigned-users-cell .icon {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .assigned-users-cell span {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .user-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .user-item .user-icon {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .user-item span {
          color: #374151;
        }
      `}</style>
    </div>
  );
};

export default ScheduledNotificationsManager;

'use client';

import React, { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import MainContent from '@/components/MainContent';
import Table from '@/components/Table';
import SearchBar from '../../components/SearchBar';
import Modal from '@/components/Modal';
import NotificationItem from '@/components/NotificationItem';
import NotificationStatusBadge from '@/components/NotificationStatusBadge'
import Button from '../../components/Button';
import { PiChecks, PiTrashLight, PiArrowCounterClockwiseFill  } from "react-icons/pi";
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Loader from '@/components/Loader';

export default function NotificationCenterPage() {
  const { user } = useContext(AuthContext);
  const {
    notifications,
    handleSearch,
    handleMarkAsRead,
    handleMarkAllAsRead,
    fetchNotifications,
    handleDelete,
    handleDeleteAll,
    loading,
  } = useNotifications(user?.id);

  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteDialogMessage, setDeleteDialogMessage] = useState("");
  const [deletingMode, setDeletingMode] = useState("");

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

    const columns = [
      { key: 'title', header: 'Título' },
      { key: 'message', header: 'Mensaje' },
      {
        key: 'read',
        header: 'Estado',
        render: (value) => <NotificationStatusBadge isRead={value} size="small" />,
      },
      {
        key: 'created_at',
        header: 'Fecha',
        render: (value) =>
          new Date(value).toLocaleString('es-CR', {
            dateStyle: 'short',
            timeStyle: 'short',
          }),
      },
      {
        key: 'actions',
        header: 'Eliminar',
        render: (_, row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row.id);
            }}
            style={{
              color: '#dc2626',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            title="Eliminar notificación"
          >
            🗑️
          </button>
        ),
      },
    ];

      const handleDeleteAllClick = () => {
        setDeletingMode("all")
        setShowDeleteDialog(true);
        setDeleteDialogMessage("¿Está seguro de que desea eliminar todas las notificaciones?")
       };

      const handleDeleteClick = (notification) => {
        setDeletingMode("one")
        setNotificationToDelete(notification);
        setShowDeleteDialog(true);
        setDeleteDialogMessage("¿Está seguro de que desea eliminar la notificación?")
      };

      const handleConfirmDelete = async () => {
        try {
          if(deletingMode == "one"){
            await handleDelete(notificationToDelete);
          } else {
            await handleDeleteAll();
          }
          setShowDeleteDialog(false);
          setNotificationToDelete(null);
          closeModal();
        } catch (err) {
          console.error('Error al eliminar la notificación:', err);
        }
      };

      const handleCancelDelete = () => {
        setShowDeleteDialog(false);
        setNotificationToDelete(null);
        setDeletingMode("");
      };

    const onRowClick = async (notif) => {
      if (!notif.read) {
        await handleMarkAsRead(notif.id);
      }
      setSelectedNotification(notif);
    };

    return (
    <MainContent>
    <div className="page-container">
      <h1>Centro de Notificaciones</h1>

      {loading && (
      <div className="overlay-loader">
        <Loader text="Cargando notificaciones..." />
      </div>
      )}

      <div className="controls">
        <SearchBar
            onSearch={handleSearch}
            placeholder="Buscar notificaciones..."
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todas</option>
          <option value="unread">No leídas</option>
          <option value="read">Leídas</option>
        </select>
     
        <Button
          variant="primary"
          onClick={handleMarkAllAsRead}
          rightIcon={<PiChecks />}
          title="Marcar todas las notificaciones como leídas"
        >
          Marcar todas como leídas
        </Button>

        <Button
          variant="primary"
          onClick={handleDeleteAllClick}
          rightIcon={PiTrashLight}
          title="Borrar todas las notificaciones"
        >
        Borrar todas las notificaciones
        </Button>

        <Button
          variant="primary"
          onClick={fetchNotifications}
          title="Refrescar"
        >
          {<PiArrowCounterClockwiseFill />}
        </Button>
      </div>

      <Table
        columns={columns}
        data={filteredNotifications}
        onRowClick={onRowClick}
        rowClassName={(row) => (!row.read ? 'unread-row' : '')}
      />

        <Modal
          isOpen={!!selectedNotification}
          onClose={() => setSelectedNotification(null)}
          title="Detalle de Notificación"
          size="medium"
        >
          <NotificationItem notification={selectedNotification} />
        </Modal>

        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="¿Eliminar notificación?"
          message={deleteDialogMessage}
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
        />

       <style jsx>{`
          .page-container {
            padding: 2rem;
          }

          .controls {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            align-items: center;
          }

          input {
            flex: 1;
            padding: 0.5rem 1rem;
            border: 1px solid #ccc;
            border-radius: 4px;
          }

          select,
          button {
            padding: 0.5rem 1rem;
            border-radius: 4px;
            border: 1px solid #ccc;
          }
        `}</style>
    </div>
      
    </MainContent>

  );
}

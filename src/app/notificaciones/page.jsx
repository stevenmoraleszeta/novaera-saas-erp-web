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
    handleCreate,
  } = useNotifications(user?.id);

  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteDialogMessage, setDeleteDialogMessage] = useState("");
  const [deletingMode, setDeletingMode] = useState("");

  // Estado para crear notificación
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: '',
    title: '',
    message: '',
    linkToModule: '',
    reminderAt: ''
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [modulesList, setModulesList] = useState([]);

  // Cargar usuarios al abrir el modal de crear notificación y al cargar la página
  React.useEffect(() => {
    import('@/services/userService').then(mod => {
      mod.getUsers({ limit: 1000 }).then(result => {
        setUsersList(Array.isArray(result?.users) ? result.users : []);
      });
    });
  }, []);

  React.useEffect(() => {
    if (showCreateModal) {
      import('@/services/userService').then(mod => {
        mod.getUsers({ limit: 1000 }).then(result => {
          setUsersList(Array.isArray(result?.users) ? result.users : []);
        });
      });
    }
  }, [showCreateModal]);

  // Cargar módulos al cargar la página
  React.useEffect(() => {
    import('@/services/moduleService').then(mod => {
      mod.getModules().then(result => {
        setModulesList(Array.isArray(result?.modules) ? result.modules : []);
      });
    });
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

    const columns = [
      { key: 'title', header: 'Título' },
      { key: 'message', header: 'Mensaje' },
      {
        key: 'user',
        header: 'Usuario',
        render: (_, row) => {
          // Buscar el usuario en usersList, si no está, mostrar el id como fallback
          const userObj = usersList.find(u => String(u.id) === String(row.userId));
          return userObj ? `${userObj.name} (${userObj.email})` : row.userId;
        },
      },
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
        key: 'module',
        header: 'Módulo',
        render: (_, row) => {
          if (!row.linkToModule) return '';
          // Buscar el módulo por el link
          const moduleObj = modulesList.find(m => `/modulos/${m.id}` === row.linkToModule);
          return moduleObj ? moduleObj.name : row.linkToModule;
        },
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

      <Button
        variant="success"
        onClick={() => setShowCreateModal(true)}
        style={{ marginBottom: '1rem' }}
      >
        Crear notificación
      </Button>

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

        {/* Modal para crear notificación */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Crear notificación"
          size="small"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setCreateError('');
              if (!createForm.title || !createForm.message || !createForm.userId) {
                setCreateError('Debes seleccionar un usuario, título y mensaje');
                return;
              }
              setCreating(true);
              try {
                await handleCreate({
                  userId: createForm.userId,
                  title: createForm.title,
                  message: createForm.message,
                  linkToModule: createForm.linkToModule ? createForm.linkToModule : null,
                  reminderAt: createForm.reminderAt || null,
                  read: false,
                });
                setShowCreateModal(false);
                setCreateForm({ userId: '', title: '', message: '', linkToModule: '', reminderAt: '' });
              } catch (err) {
                setCreateError('Error al crear la notificación');
              } finally {
                setCreating(false);
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}
          >
            <label style={{ fontWeight: 500, marginBottom: 4 }}>
              Usuario
              <select
                name="userId"
                value={createForm.userId}
                onChange={e => setCreateForm({ ...createForm, userId: e.target.value })}
                required
                style={{ width: '100%', marginBottom: 12, minHeight: 36, borderRadius: 6, padding: 6 }}
              >
                <option value="">Seleccione un usuario</option>
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </label>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>
              Título
              <input
                name="title"
                value={createForm.title}
                onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                required
                style={{ width: '100%', marginBottom: 12, borderRadius: 6, padding: 6, border: '1px solid #ccc' }}
                maxLength={100}
              />
            </label>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>
              Mensaje
              <textarea
                name="message"
                value={createForm.message}
                onChange={e => setCreateForm({ ...createForm, message: e.target.value })}
                required
                style={{ width: '100%', marginBottom: 12, borderRadius: 6, padding: 6, border: '1px solid #ccc', minHeight: 60 }}
              />
            </label>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>
              Link al módulo (opcional)
              <select
                name="linkToModule"
                value={createForm.linkToModule}
                onChange={e => setCreateForm({ ...createForm, linkToModule: e.target.value })}
                style={{ width: '100%', marginBottom: 12, borderRadius: 6, padding: 6, border: '1px solid #ccc' }}
              >
                <option value="">Seleccione un módulo</option>
                {modulesList.map(m => (
                  <option key={m.id} value={`/modulos/${m.id}`}>{m.name}</option>
                ))}
              </select>
            </label>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>
              Recordatorio para (opcional)
              <input
                name="reminderAt"
                type="datetime-local"
                value={createForm.reminderAt}
                onChange={e => setCreateForm({ ...createForm, reminderAt: e.target.value })}
                style={{ width: '100%', marginBottom: 12, borderRadius: 6, padding: 6, border: '1px solid #ccc' }}
              />
            </label>
            {createError && <div style={{ color: 'red', marginBottom: 8 }}>{createError}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="success" loading={creating}>
                Crear
              </Button>
            </div>
          </form>
        </Modal>

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

// UserDetailView.jsx - Component to display detailed user information
import React, { useContext } from 'react';
import UserStatusBadge from './UserStatusBadge';
import Button from './Button';
import ConfirmationModal from './ConfirmationModal';
import Alert from './Alert';
import { useConfirmationModal } from '../hooks/useModal';
import { AuthContext } from '../context/AuthContext';
import {
  PiPencilBold,
  PiTrashBold,
  PiCalendarBold,
  PiEnvelopeBold,
  PiUserBold,
  PiShieldBold,
  PiToggleLeftBold,
  PiToggleRightBold,
  PiLockBold,
  PiLockOpenBold
} from 'react-icons/pi';

/**
 * Props:
 *  - user: object (user data)
 *  - onEdit: function
 *  - onDelete: function
 *  - onToggleStatus: function
 *  - onBlockUser: function
 *  - onUnblockUser: function
 *  - onClose: function
 *  - loading: boolean (default: false)
 *  - error: string | null
 *  - success: string | null
 *  - onClearMessages: function
 *  - canEdit: boolean (default: true)
 *  - canDelete: boolean (default: true)
 *  - canManageStatus: boolean (default: true)
 *  - canBlockUsers: boolean (default: false)
 */
export default function UserDetailView({
  user,
  onEdit,
  onDelete,
  onToggleStatus,
  onBlockUser,
  onUnblockUser,
  onClose,
  loading = false,
  error = null,
  success = null,
  onClearMessages,
  canEdit = true,
  canDelete = true,
  canManageStatus = true,
  canBlockUsers = false
}) {
  // Get current user context for permissions
  const { user: currentUser } = useContext(AuthContext);

  // Confirmation modal hook
  const {
    isOpen: isConfirmationOpen,
    confirmationData,
    openConfirmation,
    closeConfirmation,
    handleConfirm,
    handleCancel
  } = useConfirmationModal();

  if (!user) {
    return (
      <div className="user-detail-view">
        <div className="no-user">
          <PiUserBold className="no-user-icon" />
          <p>No se encontró información del usuario</p>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Get role display name
  const getRoleDisplayName = (role) => {
    if (!role) return 'Sin rol';

    const roleMap = {
      admin: 'Administrador',
      manager: 'Gerente',
      supervisor: 'Supervisor',
      user: 'Usuario'
    };

    const displayName = roleMap[role.toLowerCase()] || role;
    console.log(`🏷️ Role display mapping: "${role}" -> "${displayName}"`);
    return displayName;
  };

  // Check permissions based on current user role
  const hasPermission = (action) => {
    if (!currentUser) return false;

    const currentUserRole = currentUser.role?.toLowerCase();
    const targetUserRole = user.role?.toLowerCase();

    switch (action) {
      case 'edit':
        return canEdit && (
          currentUserRole === 'admin' ||
          (currentUserRole === 'manager' && targetUserRole !== 'admin')
        );
      case 'delete':
        return canDelete && currentUserRole === 'admin';
      case 'toggleStatus':
        return canManageStatus && (
          currentUserRole === 'admin' ||
          (currentUserRole === 'manager' && targetUserRole !== 'admin')
        );
      case 'block':
        return canBlockUsers && currentUserRole === 'admin';
      default:
        return false;
    }
  };

  // Handle status toggle with confirmation
  const handleToggleStatus = () => {
    const action = user.isActive ? 'desactivar' : 'activar';
    const actionCapitalized = user.isActive ? 'Desactivar' : 'Activar';

    openConfirmation({
      title: `${actionCapitalized} Usuario`,
      message: `¿Estás seguro de que deseas ${action} a ${user.name}? ${user.isActive
        ? 'El usuario no podrá acceder al sistema.'
        : 'El usuario podrá acceder al sistema nuevamente.'
        }`,
      confirmText: `Sí, ${action}`,
      cancelText: 'Cancelar',
      type: user.isActive ? 'warning' : 'default',
      onConfirm: () => onToggleStatus && onToggleStatus(user)
    });
  };

  // Handle user blocking with confirmation
  const handleBlockUser = () => {
    openConfirmation({
      title: 'Bloquear Usuario',
      message: `¿Estás seguro de que deseas bloquear a ${user.name}? El usuario no podrá acceder al sistema hasta ser desbloqueado.`,
      confirmText: 'Sí, bloquear',
      cancelText: 'Cancelar',
      type: 'danger',
      onConfirm: () => onBlockUser && onBlockUser(user)
    });
  };

  // Handle user unblocking with confirmation
  const handleUnblockUser = () => {
    openConfirmation({
      title: 'Desbloquear Usuario',
      message: `¿Estás seguro de que deseas desbloquear a ${user.name}? El usuario podrá acceder al sistema nuevamente.`,
      confirmText: 'Sí, desbloquear',
      cancelText: 'Cancelar',
      type: 'default',
      onConfirm: () => onUnblockUser && onUnblockUser(user)
    });
  };

  // Handle user deletion with confirmation
  const handleDeleteUser = () => {
    openConfirmation({
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de que deseas eliminar a ${user.name}? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
      onConfirm: () => onDelete && onDelete(user)
    });
  };

  return (
    <div className="user-detail-view">
      {/* Notifications */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={onClearMessages}
        />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={onClearMessages}
        />
      )}

      {/* User Header */}
      <div className="user-header">
        <div className="user-avatar-large">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span className="avatar-initials">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
        <div className="user-info">
          <h2 className="user-name">{user.name || 'Sin nombre'}</h2>
          <p className="user-email">{user.email}</p>
          <div className="user-badges">
            <UserStatusBadge isActive={user.isActive} size="medium" />
            {user.isBlocked && (
              <span className="blocked-badge">Bloqueado</span>
            )}
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="user-details">
        <div className="detail-section">
          <h3>Información Personal</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <PiUserBold className="detail-icon" />
              <div className="detail-content">
                <label>Nombre completo</label>
                <span>{user.name || 'No especificado'}</span>
              </div>
            </div>

            <div className="detail-item">
              <PiEnvelopeBold className="detail-icon" />
              <div className="detail-content">
                <label>Correo electrónico</label>
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Información del Sistema</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <PiShieldBold className="detail-icon" />
              <div className="detail-content">
                <label>Rol</label>
                <span className={`role-badge ${user.role?.toLowerCase()}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <PiCalendarBold className="detail-icon" />
              <div className="detail-content">
                <label>Fecha de registro</label>
                <span>{formatDate(user.createdAt)}</span>
              </div>
            </div>

            {user.lastLogin && (
              <div className="detail-item">
                <PiCalendarBold className="detail-icon" />
                <div className="detail-content">
                  <label>Último acceso</label>
                  <span>{formatDate(user.lastLogin)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Information */}
        <div className="detail-section">
          <h3>Estado de la Cuenta</h3>
          <div className="status-info">
            <div className="status-item">
              <span className="status-label">Estado:</span>
              <UserStatusBadge isActive={user.isActive} size="small" />
              <span className="status-description">
                {user.isActive ? 'Cuenta activa y operativa' : 'Cuenta desactivada'}
              </span>
            </div>

            {user.isBlocked && (
              <div className="status-item blocked">
                <span className="status-label">Bloqueo:</span>
                <span className="blocked-badge">Bloqueado</span>
                <span className="status-description">
                  Usuario bloqueado por el administrador
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="detail-actions">
        <div className="primary-actions">
          {hasPermission('edit') && (
            <Button
              variant="primary"
              onClick={() => onEdit(user)}
              leftIcon={<PiPencilBold />}
              disabled={loading}
            >
              Editar Usuario
            </Button>
          )}

          {hasPermission('toggleStatus') && (
            <Button
              variant={user.isActive ? "outline" : "primary"}
              onClick={handleToggleStatus}
              leftIcon={user.isActive ? <PiToggleLeftBold /> : <PiToggleRightBold />}
              disabled={loading}
            >
              {user.isActive ? 'Desactivar' : 'Activar'}
            </Button>
          )}

          {hasPermission('block') && !user.isBlocked && (
            <Button
              variant="outline"
              onClick={handleBlockUser}
              leftIcon={<PiLockBold />}
              disabled={loading}
            >
              Bloquear
            </Button>
          )}

          {hasPermission('block') && user.isBlocked && (
            <Button
              variant="primary"
              onClick={handleUnblockUser}
              leftIcon={<PiLockOpenBold />}
              disabled={loading}
            >
              Desbloquear
            </Button>
          )}
        </div>

        <div className="secondary-actions">
          {hasPermission('delete') && (
            <Button
              variant="danger"
              onClick={handleDeleteUser}
              leftIcon={<PiTrashBold />}
              disabled={loading}
            >
              Eliminar Usuario
            </Button>
          )}

          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cerrar
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={closeConfirmation}
        title={confirmationData.title}
        message={confirmationData.message}
        confirmText={confirmationData.confirmText}
        cancelText={confirmationData.cancelText}
        type={confirmationData.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={confirmationData.loading}
      />

      <style jsx>{`
        .user-detail-view {
          padding: 0;
          background: white;
        }

        .no-user {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: var(--text-secondary, #6b7280);
          text-align: center;
        }

        .no-user-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .user-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          border-bottom: 1px solid var(--border-color, #e5e7eb);
          background: var(--background, #f9fafb);
        }

        .user-avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--primary-green, #7ed957);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-avatar-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-initials {
          color: white;
          font-size: 2rem;
          font-weight: 600;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .user-email {
          margin: 0 0 1rem 0;
          color: var(--text-secondary, #6b7280);
          font-size: 1rem;
        }

        .user-badges {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .blocked-badge {
          background: var(--error-bg, #fee2e2);
          color: var(--error-text, #dc2626);
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .user-details {
          padding: 2rem;
        }

        .detail-section {
          margin-bottom: 2rem;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 0.5rem;
          background: var(--background, #f9fafb);
        }

        .detail-icon {
          color: var(--primary-green, #7ed957);
          font-size: 1.25rem;
          margin-top: 0.125rem;
          flex-shrink: 0;
        }

        .detail-content {
          flex: 1;
        }

        .detail-content label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.025em;
          margin-bottom: 0.25rem;
        }

        .detail-content span {
          display: block;
          color: var(--text-primary, #111827);
          font-weight: 500;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .role-badge.admin {
          background: #fef3c7;
          color: #d97706;
        }

        .role-badge.manager {
          background: #e0f2fe;
          color: #0369a1;
        }

        .role-badge.supervisor {
          background: #f3e8ff;
          color: #7c3aed;
        }

        .role-badge.user {
          background: #f0f9ff;
          color: #0284c7;
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 0.5rem;
          background: var(--background, #f9fafb);
        }

        .status-item.blocked {
          border-color: var(--error-text, #dc2626);
          background: var(--error-bg, #fee2e2);
        }

        .status-label {
          font-weight: 500;
          color: var(--text-primary, #111827);
          min-width: 60px;
        }

        .status-description {
          color: var(--text-secondary, #6b7280);
          font-size: 0.875rem;
        }

        .detail-actions {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--border-color, #e5e7eb);
          background: var(--background, #f9fafb);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .primary-actions,
        .secondary-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .primary-actions {
          padding-bottom: 0.5rem;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .user-header {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
          }

          .user-details {
            padding: 1.5rem;
          }

          .detail-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .detail-actions {
            padding: 1.5rem;
          }

          .primary-actions,
          .secondary-actions {
            flex-direction: column;
            gap: 0.75rem;
          }

          .secondary-actions {
            flex-direction: column-reverse;
          }

          .primary-actions :global(button),
          .secondary-actions :global(button) {
            width: 100%;
          }

          .status-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
} 
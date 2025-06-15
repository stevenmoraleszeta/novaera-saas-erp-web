import React, { useState } from 'react';
import {
    PiCaretUpBold,
    PiCaretDownBold,
    PiPencilBold,
    PiEyeBold,
    PiTrashBold,
    PiToggleLeftBold,
    PiToggleRightBold,
    PiUserBold,
    PiEnvelopeBold,
    PiShieldCheckBold
} from 'react-icons/pi';
import UserStatusBadge from './UserStatusBadge';

export default function UsersTable({
    users = [],
    onEdit,
    onView,
    onDelete,
    onToggleStatus,
    loading = false,
    sortConfig = { key: null, direction: 'asc' },
    onSort
}) {
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        onSort({ key, direction });
    };

    // Handle select all users
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedUsers(users.map(user => user.id));
        } else {
            setSelectedUsers([]);
        }
    };

    // Handle select single user
    const handleSelectUser = (userId, checked) => {
        if (checked) {
            setSelectedUsers([...selectedUsers, userId]);
        } else {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Render sort icon
    const renderSortIcon = (column) => {
        if (sortConfig.key !== column) {
            return <span className="sort-icon inactive"></span>;
        }

        return (
            <span className="sort-icon active">
                {sortConfig.direction === 'asc' ? <PiCaretUpBold /> : <PiCaretDownBold />}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="table-loading">
                <div className="loading-spinner"></div>
                <span>Cargando usuarios...</span>
                <style jsx>{`
          .table-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3em;
            color: #6b7280;
          }
          .loading-spinner {
            width: 2em;
            height: 2em;
            border: 3px solid #f3f4f6;
            border-top: 3px solid #7ed957;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1em;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="empty-state">
                <PiUserBold className="empty-icon" />
                <h3>No se encontraron usuarios</h3>
                <p>No hay usuarios que coincidan con los criterios de búsqueda.</p>
                <style jsx>{`
          .empty-state {
            text-align: center;
            padding: 3em 2em;
            color: #6b7280;
          }
          .empty-icon {
            font-size: 3em;
            color: #d1d5db;
            margin-bottom: 1em;
          }
          .empty-state h3 {
            margin: 0 0 0.5em 0;
            color: #374151;
          }
          .empty-state p {
            margin: 0;
            font-size: 0.9em;
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th className="checkbox-column">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === users.length && users.length > 0}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="table-checkbox"
                                />
                            </th>
                            <th
                                className="sortable-header"
                                onClick={() => handleSort('name')}
                            >
                                <div className="header-content">
                                    <PiUserBold className="header-icon" />
                                    <span>Nombre</span>
                                    {renderSortIcon('name')}
                                </div>
                            </th>
                            <th
                                className="sortable-header"
                                onClick={() => handleSort('email')}
                            >
                                <div className="header-content">
                                    <PiEnvelopeBold className="header-icon" />
                                    <span>Email</span>
                                    {renderSortIcon('email')}
                                </div>
                            </th>
                            <th
                                className="sortable-header"
                                onClick={() => handleSort('role')}
                            >
                                <div className="header-content">
                                    <PiShieldCheckBold className="header-icon" />
                                    <span>Rol</span>
                                    {renderSortIcon('role')}
                                </div>
                            </th>
                            <th
                                className="sortable-header"
                                onClick={() => handleSort('isActive')}
                            >
                                <div className="header-content">
                                    <span>Estado</span>
                                    {renderSortIcon('isActive')}
                                </div>
                            </th>
                            <th
                                className="sortable-header"
                                onClick={() => handleSort('createdAt')}
                            >
                                <div className="header-content">
                                    <span>Fecha Registro</span>
                                    {renderSortIcon('createdAt')}
                                </div>
                            </th>
                            <th className="actions-column">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="table-row">
                                <td className="checkbox-column">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                                        className="table-checkbox"
                                    />
                                </td>
                                <td className="user-name">
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="user-details">
                                            <span className="name">{user.name || 'Sin nombre'}</span>
                                            <span className="username">@{user.username || user.email?.split('@')[0]}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="user-email">{user.email}</td>
                                <td className="user-role">
                                    <span className={`role-badge ${user.role?.toLowerCase()}`}>
                                        {user.role || 'Usuario'}
                                    </span>
                                </td>
                                <td className="user-status">
                                    <UserStatusBadge isActive={user.isActive} size="small" />
                                </td>
                                <td className="user-date">
                                    {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                </td>
                                <td className="user-actions">
                                    <div className="actions-group">
                                        <button
                                            onClick={() => onView(user)}
                                            className="action-button view"
                                            title="Ver detalles"
                                        >
                                            <PiEyeBold />
                                        </button>
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="action-button edit"
                                            title="Editar usuario"
                                        >
                                            <PiPencilBold />
                                        </button>
                                        <button
                                            onClick={() => onToggleStatus(user)}
                                            className={`action-button toggle ${user.isActive ? 'active' : 'inactive'}`}
                                            title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                                        >
                                            {user.isActive ? <PiToggleRightBold /> : <PiToggleLeftBold />}
                                        </button>
                                        <button
                                            onClick={() => onDelete(user)}
                                            className="action-button delete"
                                            title="Eliminar usuario"
                                        >
                                            <PiTrashBold />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        
        .table-wrapper {
          overflow-x: auto;
        }
        
        .users-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9em;
        }
        
        .users-table th,
        .users-table td {
          padding: 1em 0.8em;
          text-align: left;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .users-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
          font-size: 0.85em;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .sortable-header {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s ease;
        }
        
        .sortable-header:hover {
          background: #f3f4f6;
        }
        
        .header-content {
          display: flex;
          align-items: center;
          gap: 0.5em;
        }
        
        .header-icon {
          color: #7ed957;
          font-size: 1em;
        }
        
        .sort-icon {
          margin-left: auto;
          color: #9ca3af;
          transition: color 0.2s ease;
        }
        
        .sort-icon.active {
          color: #7ed957;
        }
        
        .table-row {
          transition: background-color 0.2s ease;
        }
        
        .table-row:hover {
          background: #f9fafb;
        }
        
        .checkbox-column {
          width: 3em;
          text-align: center;
        }
        
        .table-checkbox {
          width: 1.1em;
          height: 1.1em;
          accent-color: #7ed957;
          cursor: pointer;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.8em;
        }
        
        .user-avatar {
          width: 2.5em;
          height: 2.5em;
          background: linear-gradient(135deg, #7ed957, #6bb946);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9em;
          flex-shrink: 0;
        }
        
        .user-details {
          display: flex;
          flex-direction: column;
          gap: 0.2em;
        }
        
        .name {
          font-weight: 500;
          color: #111827;
        }
        
        .username {
          font-size: 0.8em;
          color: #6b7280;
        }
        
        .user-email {
          color: #6b7280;
        }
        
        .role-badge {
          display: inline-block;
          padding: 0.3em 0.7em;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .role-badge.admin {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .role-badge.manager {
          background: #fef3c7;
          color: #d97706;
        }
        
        .role-badge.user {
          background: #e0f2fe;
          color: #0369a1;
        }
        
        .actions-column {
          width: 10em;
          text-align: center;
        }
        
        .actions-group {
          display: flex;
          gap: 0.3em;
          justify-content: center;
        }
        
        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2em;
          height: 2em;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9em;
        }
        
        .action-button.view {
          background: #e0f2fe;
          color: #0369a1;
        }
        
        .action-button.view:hover {
          background: #bae6fd;
          transform: translateY(-1px);
        }
        
        .action-button.edit {
          background: #fef3c7;
          color: #d97706;
        }
        
        .action-button.edit:hover {
          background: #fde68a;
          transform: translateY(-1px);
        }
        
        .action-button.toggle.active {
          background: #d4f2cb;
          color: #2d5a27;
        }
        
        .action-button.toggle.active:hover {
          background: #bbf7af;
          transform: translateY(-1px);
        }
        
        .action-button.toggle.inactive {
          background: #f3f4f6;
          color: #6b7280;
        }
        
        .action-button.toggle.inactive:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
        }
        
        .action-button.delete {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .action-button.delete:hover {
          background: #fecaca;
          transform: translateY(-1px);
        }
        
        @media (max-width: 768px) {
          .users-table th,
          .users-table td {
            padding: 0.7em 0.5em;
          }
          
          .users-table {
            font-size: 0.8em;
          }
          
          .user-avatar {
            width: 2em;
            height: 2em;
            font-size: 0.8em;
          }
          
          .actions-group {
            gap: 0.2em;
          }
          
          .action-button {
            width: 1.8em;
            height: 1.8em;
            font-size: 0.8em;
          }
        }
      `}</style>
        </div>
    );
} 
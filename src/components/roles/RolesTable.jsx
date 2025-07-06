"use client";
import React, { useState } from 'react';
import {
  PiCaretUpBold,
  PiCaretDownBold,
  PiPencilBold,
  PiTrashBold,
  PiShieldCheckBold,
  PiToggleLeftBold,
  PiToggleRightBold,
  PiUsersBold
} from 'react-icons/pi';
import RoleStatusBadge from './RoleStatusBadge';

export default function RolesTable({
  roles = [],
  onEdit,
  onDelete,
  onViewPermissions,
  onSelectForPermissions,
  selectedRole,
  loading = false,
  sortConfig = { key: null, direction: 'asc' },
  onSort
}) {
  const [selectedRoles, setSelectedRoles] = useState([]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    onSort && onSort({ key, direction });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRoles(roles.map(role => role.id));
    } else {
      setSelectedRoles([]);
    }
  };

  const handleSelectRole = (roleId, checked) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, roleId]);
    } else {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    }
  };

  const renderSortIcon = (column) => {
    if (!onSort) return null;
    if (sortConfig.key !== column) {
      return <span className="sort-icon inactive"></span>;
    }
    return (
      <span className="sort-icon active">
        {sortConfig.direction === 'asc' ? <PiCaretUpBold /> : <PiCaretDownBold />}
      </span>
    );
  };

  const handleSelectRoleForPermissions = (role) => {
    if (onSelectForPermissions) {
      onSelectForPermissions(role);
    }
  };

  const isRoleSelectedForPermissions = (role) => {
    return selectedRole && selectedRole.id === role.id;
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <span>Cargando roles...</span>
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

  if (roles.length === 0) {
    return (
      <div className="empty-state">
        <PiUsersBold className="empty-icon" />
        <h3>No se encontraron roles</h3>
        <p>No hay roles que coincidan con los criterios de búsqueda.</p>
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
        <table className="roles-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectedRoles.length === roles.length && roles.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="table-checkbox"
                />
              </th>
              <th className="sortable-header" onClick={() => handleSort('name')}>
                <div className="header-content">
                  <PiShieldCheckBold className="header-icon" />
                  <span>Nombre</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th className="sortable-header" onClick={() => handleSort('description')}>
                <div className="header-content">
                  <span>Descripción</span>
                  {renderSortIcon('description')}
                </div>
              </th>
              <th className="sortable-header" onClick={() => handleSort('active')}>
                <div className="header-content">
                  <span>Estado</span>
                  {renderSortIcon('active')}
                </div>
              </th>
              <th className="actions-column">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr 
                key={role.id} 
                className={`table-row ${isRoleSelectedForPermissions(role) ? 'selected-for-permissions' : ''}`}
                onClick={() => handleSelectRoleForPermissions(role)}
                style={{ cursor: 'pointer' }}
              >
                <td className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectRole(role.id, e.target.checked);
                    }}
                    className="table-checkbox"
                  />
                </td>
                <td className="role-name">
                  <span className="role-badge-main">{role.name}</span>
                  {isRoleSelectedForPermissions(role) && (
                    <span className="selected-indicator">• Editando permisos</span>
                  )}
                </td>
                <td className="role-description">{role.description || '-'}</td>
                <td className="role-status">
                  <RoleStatusBadge active={role.active} />
                </td>
                <td className="role-actions">
                  <div className="actions-group">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(role);
                      }}
                      className="action-button edit"
                      title="Editar rol"
                    >
                      <PiPencilBold style={{ marginRight: 4 }} /> Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewPermissions && onViewPermissions(role);
                      }}
                      className={`action-button view ${isRoleSelectedForPermissions(role) ? 'selected' : ''}`}
                      title="Ver permisos"
                      style={{ background: '#e0f2fe', color: '#0284c7' }}
                    >
                      <PiShieldCheckBold style={{ marginRight: 4 }} /> Permisos
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(role);
                      }}
                      className="action-button delete"
                      title="Eliminar rol"
                    >
                      <PiTrashBold style={{ marginRight: 4 }} /> Eliminar
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
        .roles-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9em;
        }
        .roles-table th,
        .roles-table td {
          padding: 1em 0.8em;
          text-align: left;
          border-bottom: 1px solid #f3f4f6;
        }
        .roles-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #1f2937;
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
        .role-badge-main {
          font-weight: 500;
          color: #111827;
        }
        .role-description {
          color: #374151;
        }
        .role-status {
          min-width: 90px;
        }
        .actions-column {
          width: 8em;
          text-align: center;
        }
        .actions-group {
          display: flex;
          gap: 0.7em;
          justify-content: center;
        }
        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: auto;
          min-width: 2.2em;
          height: 2.2em;
          padding: 0 0.8em;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.98em;
          font-weight: 500;
          gap: 0.4em;
        }
        .action-button svg {
          font-size: 1.1em;
        }
        .action-button.edit {
          background: #fef3c7;
          color: #d97706;
        }
        .action-button.edit:hover {
          background: #fde68a;
          transform: translateY(-1px);
        }
        .action-button.view {
          background: #e0f2fe;
          color: #0284c7;
        }
        .action-button.view:hover {
          background: #b2e0f0;
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
        .action-button.selected {
          border: 2px solid #7ed957;
          background: #f0fdf4;
        }
        .table-row.selected-for-permissions {
          background: #f8fafc;
          border-left: 4px solid #3b82f6;
        }
        .selected-indicator {
          font-size: 0.75em;
          color: #3b82f6;
          font-weight: 500;
          margin-left: 8px;
        }
        .table-row:hover {
          background: #f9fafb;
        }
        .table-row.selected-for-permissions:hover {
          background: #f1f5f9;
        }
        @media (max-width: 768px) {
          .roles-table th,
          .roles-table td {
            padding: 0.7em 0.5em;
          }
          .roles-table {
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

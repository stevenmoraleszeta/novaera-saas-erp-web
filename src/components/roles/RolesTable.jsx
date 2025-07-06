"use client";
import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Shield
} from 'lucide-react';
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
  onSort,
  isEditingMode = false,
  searchQuery = ""
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
        {sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
    const isSearching = searchQuery && searchQuery.trim() !== '';
    return (
      <div className="empty-state">
        <Shield className="empty-icon" />
        <h3>{isSearching ? 'No se encontraron resultados' : 'No hay roles registrados'}</h3>
        <p>
          {isSearching 
            ? `No hay roles que coincidan con "${searchQuery}". Intenta con otros términos de búsqueda.`
            : 'Aún no se han creado roles en el sistema.'
          }
        </p>
        {isSearching && (
          <p className="search-suggestion">
            <strong>Sugerencias:</strong> Busca por nombre o descripción del rol.
          </p>
        )}
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
            font-size: 1.125rem;
            font-weight: 600;
          }
          .empty-state p {
            margin: 0 0 1em 0;
            font-size: 0.9em;
            line-height: 1.5;
          }
          .search-suggestion {
            background: #f3f4f6;
            padding: 1em;
            border-radius: 8px;
            font-size: 0.875rem !important;
            color: #4b5563 !important;
            margin-top: 1em !important;
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
                  <Shield className="header-icon w-4 h-4" />
                  <span>Nombre</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              {!isEditingMode && <th className="actions-column">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr 
                key={role.id} 
                className={`table-row ${isEditingMode ? 'clickable' : ''} ${isRoleSelectedForPermissions(role) ? 'selected-for-permissions' : ''}`}
                onClick={() => {
                  if (isEditingMode) {
                    onEdit && onEdit(role);
                  } else {
                    handleSelectRoleForPermissions(role);
                  }
                }}
              >
                <td className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={(e) => handleSelectRole(role.id, e.target.checked)}
                    className="table-checkbox"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="role-name">
                  <div className="role-info">
                    <div className="role-avatar">
                      {role.name?.charAt(0)?.toUpperCase() || 'R'}
                    </div>
                    <div className="role-details">
                      <span className="name">{role.name}</span>
                      {isRoleSelectedForPermissions(role) && !isEditingMode && (
                        <span className="selected-indicator">• Editando permisos</span>
                      )}
                    </div>
                  </div>
                </td>
                {!isEditingMode && (
                  <td className="role-actions">
                    <div className="actions-group">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewPermissions && onViewPermissions(role);
                        }}
                        className={`action-button view ${isRoleSelectedForPermissions(role) ? 'selected' : ''}`}
                        title="Ver permisos"
                      >
                        <Shield className="w-4 h-4 mr-1" /> Permisos
                      </button>
                    </div>
                  </td>
                )}
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
          background: #f3f4f6;
          color: #374151;
        }
        .action-button.view:hover {
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
        .action-button.selected {
          border: 2px solid #7ed957;
          background: #f0fdf4;
        }
        .table-row.selected-for-permissions {
          background: #f8fafc;
          border-left: 4px solid #3b82f6;
        }
        
        .table-row.clickable {
          cursor: pointer;
        }
        
        .table-row.clickable:hover {
          background-color: #f8fafc;
        }
        
        .role-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .role-avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #7ed957 0%, #5cb85c 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .role-details {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        
        .role-details .name {
          font-weight: 600;
          color: #111827;
        }
        
        .selected-indicator {
          font-size: 0.75rem;
          color: #0284c7;
          font-weight: 500;
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

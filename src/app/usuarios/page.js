'use client';

import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import MainContent from '../../components/MainContent';
import SearchBar from '../../components/SearchBar';
import UsersTable from '../../components/UsersTable';
import Pagination from '../../components/Pagination';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { PiPlusBold, PiUsersBold, PiDownloadBold, PiUploadBold } from 'react-icons/pi';

export default function UsuariosPage() {
  const { user, status } = useContext(AuthContext);

  // Use custom hook for user management
  const {
    users,
    loading,
    error,
    success,
    currentPage,
    totalPages,
    totalUsers,
    itemsPerPage,
    searchQuery,
    sortConfig,
    filters,
    handleSearch,
    handleSort,
    handlePageChange,
    handleFilterChange,
    handleToggleUserStatus,
    handleDeleteUser,
    clearMessages
  } = useUsers();

  // Handle user actions
  const handleViewUser = (user) => {
    // Navigate to user detail page or open modal
    console.log('View user:', user);
    // TODO: Implement user detail view
  };

  const handleEditUser = (user) => {
    // Navigate to edit user page or open modal
    console.log('Edit user:', user);
    // TODO: Implement user edit functionality
  };

  const handleDeleteUserWithConfirmation = async (user) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${user.name}"?`)) {
      return;
    }
    await handleDeleteUser(user);
  };

  const handleCreateUser = () => {
    // Navigate to create user page or open modal
    console.log('Create new user');
    // TODO: Implement user creation functionality
  };

  // Loading state for unauthenticated users
  if (status === 'authenticating') {
    return (
      <MainContent>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Verificando autenticación...</span>
          <style jsx>{`
            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 50vh;
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
      </MainContent>
    );
  }

  return (
    <MainContent>
      <div className="users-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="title-section">
              <PiUsersBold className="page-icon" />
              <div>
                <h1>Gestión de Usuarios</h1>
                <p>Administra los usuarios del sistema ERP</p>
              </div>
            </div>
            <div className="header-actions">
              <Button
                variant="outline"
                onClick={() => console.log('Export users')}
                leftIcon={<PiDownloadBold />}
              >
                Exportar
              </Button>
              <Button
                variant="outline"
                onClick={() => console.log('Import users')}
                leftIcon={<PiUploadBold />}
              >
                Importar
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateUser}
                leftIcon={<PiPlusBold />}
              >
                Nuevo Usuario
              </Button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={clearMessages}
          />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={clearMessages}
          />
        )}

        {/* Search and Filters */}
        <div className="search-section">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Buscar por nombre, email o rol..."
          />

          <div className="filters">
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange({ role: e.target.value })}
              className="filter-select"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="manager">Gerente</option>
              <option value="user">Usuario</option>
            </select>

            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange({ isActive: e.target.value })}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-section">
          <UsersTable
            users={users}
            loading={loading}
            sortConfig={sortConfig}
            onSort={handleSort}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onToggleStatus={handleToggleUserStatus}
            onDelete={handleDeleteUserWithConfirmation}
          />

          {!loading && users.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalUsers}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      <style jsx>{`
        .users-page {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .page-header {
          margin-bottom: 2em;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2em;
        }
        
        .title-section {
          display: flex;
          align-items: center;
          gap: 1em;
        }
        
        .page-icon {
          font-size: 2.5em;
          color: #7ed957;
          flex-shrink: 0;
        }
        
        .users-page h1 {
          margin: 0 0 0.3em 0;
          color: #111827;
          font-size: 2.2em;
          font-weight: 700;
        }
        
        .users-page p {
          margin: 0;
          color: #6b7280;
          font-size: 1.1em;
        }
        
        .header-actions {
          display: flex;
          gap: 0.8em;
          flex-shrink: 0;
        }
        
        .search-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5em;
          margin-bottom: 1.5em;
          padding: 1.5em;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
        }
        
        .filters {
          display: flex;
          gap: 1em;
        }
        
        .filter-select {
          padding: 0.7em 1em;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-size: 0.9em;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }
        
        .filter-select:focus {
          outline: none;
          border-color: #7ed957;
          box-shadow: 0 0 0 3px rgba(126, 217, 87, 0.1);
        }
        
        .table-section {
          background: white;
          border-radius: 12px;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }
          
          .header-actions {
            justify-content: flex-start;
            flex-wrap: wrap;
          }
          
          .search-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filters {
            justify-content: stretch;
          }
          
          .filter-select {
            flex: 1;
          }
        }
        
        @media (max-width: 480px) {
          .title-section {
            align-items: flex-start;
          }
          
          .page-icon {
            font-size: 2em;
          }
          
          .users-page h1 {
            font-size: 1.8em;
          }
          
          .header-actions {
            gap: 0.5em;
          }
        }
      `}</style>
    </MainContent>
  );
} 
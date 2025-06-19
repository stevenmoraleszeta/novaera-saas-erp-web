'use client';

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useUsersWithConfirmation } from '../../hooks/useUsersWithConfirmation';
import MainContent from '../../components/MainContent';
import SearchBar from '../../components/SearchBar';
import UsersTable from '../../components/UsersTable';
import Pagination from '../../components/Pagination';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import UserForm from '../../components/UserForm';
import UserDetailView from '../../components/UserDetailView';
import { PiPlusBold, PiUsersBold, PiDownloadBold, PiUploadBold, PiBugBold } from 'react-icons/pi';
import { runCompleteDiagnosis, ensureDefaultRoles, testRoleEndpoints, testRoleAssignment, assignDefaultRolesToUsers, quickUserRoleCheck, testUserCreation } from '../../utils/debugUtils';

export default function UsuariosPage() {
  const { user, status } = useContext(AuthContext);

  // Expose debug functions to global scope for easy debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.debugUsers = runCompleteDiagnosis;
      window.ensureRoles = ensureDefaultRoles;
      window.testEndpoints = testRoleEndpoints;
      window.testRoleAssign = testRoleAssignment;
      window.assignDefaultRoles = assignDefaultRolesToUsers;
      window.quickCheck = quickUserRoleCheck;
      window.testUserCreation = testUserCreation;
      console.log('🔧 Debug functions available:');
      console.log('- window.debugUsers() - Run complete diagnosis');
      console.log('- window.ensureRoles() - Ensure default roles exist');
      console.log('- window.testEndpoints() - Test role API endpoints');
      console.log('- window.testRoleAssign(userId, roleName) - Test role assignment');
      console.log('- window.assignDefaultRoles() - Assign "user" role to users without roles ⭐');
      console.log('- window.quickCheck() - Quick role status check ⚡');
      console.log('- window.testUserCreation("admin") - Test user creation with specific role 🧪');
    }
  }, []);

  // Modal state
  const [modalState, setModalState] = useState({
    showCreateModal: false,
    showEditModal: false,
    showDetailModal: false,
    selectedUser: null,
    formLoading: false,
    formError: null
  });

  // Use custom hook for user management with confirmations
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
    handleBlockUser,
    handleUnblockUser,
    handleDeleteUser,
    handleCreateUser: createUser,
    handleUpdateUser: updateUser,
    clearMessages,
    confirmationModal
  } = useUsersWithConfirmation();

  // Modal handlers
  const openCreateModal = () => {
    setModalState(prev => ({
      ...prev,
      showCreateModal: true,
      selectedUser: null,
      formError: null
    }));
  };

  const openEditModal = (user) => {
    setModalState(prev => ({
      ...prev,
      showEditModal: true,
      selectedUser: user,
      formError: null
    }));
  };

  const openDetailModal = (user) => {
    setModalState(prev => ({
      ...prev,
      showDetailModal: true,
      selectedUser: user
    }));
  };

  const closeModals = () => {
    setModalState(prev => ({
      ...prev,
      showCreateModal: false,
      showEditModal: false,
      showDetailModal: false,
      selectedUser: null,
      formLoading: false,
      formError: null
    }));
  };

  // Handle user actions
  const handleViewUser = (user) => {
    openDetailModal(user);
  };

  const handleEditUser = (user) => {
    openEditModal(user);
  };

  // User actions handlers (confirmations are handled by the hook)
  const handleDeleteUserAction = (user) => {
    handleDeleteUser(user);
  };

  const handleToggleStatusAction = (user) => {
    handleToggleUserStatus(user);
  };

  const handleBlockUserAction = (user) => {
    handleBlockUser(user);
  };

  const handleUnblockUserAction = (user) => {
    handleUnblockUser(user);
  };

  const handleCreateUser = () => {
    openCreateModal();
  };

  // Form submission handlers
  const handleCreateSubmit = async (userData) => {
    try {
      setModalState(prev => ({ ...prev, formLoading: true, formError: null }));
      await createUser(userData);
      closeModals();
    } catch (error) {
      setModalState(prev => ({
        ...prev,
        formError: error?.response?.data?.error || 'Error al crear el usuario',
        formLoading: false
      }));
    }
  };

  const handleEditSubmit = async (userData) => {
    try {
      setModalState(prev => ({ ...prev, formLoading: true, formError: null }));
      await updateUser(modalState.selectedUser.id, userData);
      closeModals();
    } catch (error) {
      setModalState(prev => ({
        ...prev,
        formError: error?.response?.data?.error || 'Error al actualizar el usuario',
        formLoading: false
      }));
    }
  };

  const handleEditFromDetail = (user) => {
    setModalState(prev => ({
      ...prev,
      showDetailModal: false,
      showEditModal: true,
      selectedUser: user,
      formError: null
    }));
  };

  const handleDeleteFromDetail = (user) => {
    handleDeleteUser(user);
    closeModals();
  };

  const handleToggleFromDetail = (user) => {
    handleToggleUserStatus(user);
  };

  const handleBlockFromDetail = (user) => {
    handleBlockUser(user);
  };

  const handleUnblockFromDetail = (user) => {
    handleUnblockUser(user);
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
              {/* Debug button for development/admin users */}
              {(process.env.NODE_ENV === 'development' || user?.role === 'admin') && (
                <Button
                  variant="outline"
                  onClick={runCompleteDiagnosis}
                  leftIcon={<PiBugBold />}
                  title="Ejecutar diagnóstico de usuarios y roles"
                >
                  Debug
                </Button>
              )}

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
            onToggleStatus={handleToggleStatusAction}
            onDelete={handleDeleteUserAction}
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

      {/* Modal para crear usuario */}
      <Modal
        isOpen={modalState.showCreateModal}
        onClose={closeModals}
        size="large"
        showCloseButton={true}
      >
        <UserForm
          mode="create"
          onSubmit={handleCreateSubmit}
          onCancel={closeModals}
          loading={modalState.formLoading}
          error={modalState.formError}
        />
      </Modal>

      {/* Modal para editar usuario */}
      <Modal
        isOpen={modalState.showEditModal}
        onClose={closeModals}
        size="large"
        showCloseButton={true}
      >
        <UserForm
          mode="edit"
          initialData={modalState.selectedUser}
          onSubmit={handleEditSubmit}
          onCancel={closeModals}
          loading={modalState.formLoading}
          error={modalState.formError}
        />
      </Modal>

      {/* Modal para ver detalles del usuario */}
      <Modal
        isOpen={modalState.showDetailModal}
        onClose={closeModals}
        size="large"
        showCloseButton={true}
      >
        <UserDetailView
          user={modalState.selectedUser}
          onEdit={handleEditFromDetail}
          onDelete={handleDeleteFromDetail}
          onToggleStatus={handleToggleFromDetail}
          onBlockUser={handleBlockFromDetail}
          onUnblockUser={handleUnblockFromDetail}
          onClose={closeModals}
          loading={loading}
          error={error}
          success={success}
          onClearMessages={clearMessages}
          canEdit={true}
          canDelete={user?.role === 'admin'}
          canManageStatus={user?.role === 'admin' || user?.role === 'manager'}
          canBlockUsers={user?.role === 'admin'}
        />
      </Modal>

      {/* Confirmation Modal for all user operations */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={confirmationModal.closeConfirmation}
        title={confirmationModal.confirmationData.title}
        message={confirmationModal.confirmationData.message}
        confirmText={confirmationModal.confirmationData.confirmText}
        cancelText={confirmationModal.confirmationData.cancelText}
        type={confirmationModal.confirmationData.type}
        onConfirm={confirmationModal.handleConfirm}
        onCancel={confirmationModal.handleCancel}
        loading={confirmationModal.confirmationData.loading}
      />

      <style jsx>{`
        .users-page {
          max-width: none;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
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
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
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
          background: #fff;
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
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
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
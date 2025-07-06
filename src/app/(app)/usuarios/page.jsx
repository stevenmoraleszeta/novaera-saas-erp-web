"use client";

import React, { useState, useEffect } from "react";
import useUserStore from "@/stores/userStore";
import useEditModeStore from "@/stores/editModeStore";
import { Badge } from "@/components/ui/badge";
import { Edit3 } from "lucide-react";
import Alert from "@/components/common/Alert";
import UserForm from "@/components/users/UserForm";
import UserList from "@/components/users/UserList";
import MainContent from "@/components/MainContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  fetchRoles, 
  assignRoleToUser, 
  getUserRoles 
} from "@/services/userService";

export default function UsuariosPage() {
  const { user } = useUserStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [roles, setRoles] = useState([]);

  const { isEditingMode } = useEditModeStore();

  const [modalState, setModalState] = React.useState({
    showModal: false,
    selectedUser: null,
    formLoading: false,
    formError: null,
  });

  // Fetch users and roles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch users - getUsers returns an object with users array
        const usersResponse = await getUsers();
        console.log('Fetched users response:', usersResponse);
        
        // Extract users array from response
        const usersData = usersResponse.users || [];
        console.log('Extracted users data:', usersData);
        
        // Fetch roles
        const rolesData = await fetchRoles();
        console.log('Fetched roles:', rolesData);
        
        // Enrich users with their roles
        const enrichedUsers = await Promise.all(
          usersData.map(async (user) => {
            try {
              console.log(`Fetching roles for user ${user.id}:`, user.name);
              const userRoles = await getUserRoles(user.id);
              console.log(`Roles for user ${user.id}:`, userRoles);
              
              // getUserRoles returns an array - could be role names or role objects
              let primaryRole = 'Sin rol';
              if (userRoles && userRoles.length > 0) {
                // Check if it's an array of strings or objects
                if (typeof userRoles[0] === 'string') {
                  primaryRole = userRoles[0];
                } else if (userRoles[0] && userRoles[0].name) {
                  primaryRole = userRoles[0].name;
                } else if (userRoles[0]) {
                  primaryRole = userRoles[0].toString();
                }
              }
              
              return {
                ...user,
                role: primaryRole,
                roles: userRoles || []
              };
            } catch (err) {
              console.warn(`Error fetching roles for user ${user.id}:`, err);
              return {
                ...user,
                role: 'Sin rol',
                roles: []
              };
            }
          })
        );
        
        setUsers(enrichedUsers);
        setRoles(rolesData);
        setTotalUsers(enrichedUsers.length);
        setTotalPages(Math.ceil(enrichedUsers.length / itemsPerPage));
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemsPerPage]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.role && user.role.toLowerCase().includes(query))
    );
  });

  // Reset to first page if search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Paginate filtered users
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  const totalFilteredPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleCreateUser = async (data) => {
    try {
      setModalState((prev) => ({
        ...prev,
        formLoading: true,
        formError: null,
      }));

      console.log('Creating user with data:', data);
      
      // Create user
      const result = await createUser(data);
      console.log('User created:', result);
      
      // If role is provided, assign it
      if (data.role && data.role !== 'Sin rol') {
        await assignRoleToUser(result.id, data.role);
      }
      
      // Refresh users list
      const usersResponse = await getUsers();
      const usersData = usersResponse.users || [];
      const enrichedUsers = await Promise.all(
        usersData.map(async (user) => {
          try {
            const userRoles = await getUserRoles(user.id);
            console.log(`Roles for user ${user.id} after create:`, userRoles);
            
            // getUserRoles returns an array - could be role names or role objects
            let primaryRole = 'Sin rol';
            if (userRoles && userRoles.length > 0) {
              // Check if it's an array of strings or objects
              if (typeof userRoles[0] === 'string') {
                primaryRole = userRoles[0];
              } else if (userRoles[0] && userRoles[0].name) {
                primaryRole = userRoles[0].name;
              } else if (userRoles[0]) {
                primaryRole = userRoles[0].toString();
              }
            }
            
            return {
              ...user,
              role: primaryRole,
              roles: userRoles || []
            };
          } catch (err) {
            return {
              ...user,
              role: 'Sin rol',
              roles: []
            };
          }
        })
      );
      
      setUsers(enrichedUsers);
      setSuccess("Usuario creado exitosamente");
      closeModal();
      
    } catch (err) {
      console.error('Error creating user:', err);
      setModalState((prev) => ({
        ...prev,
        formError: err.message || "Error al crear usuario",
        formLoading: false,
      }));
    }
  };

  const handleUpdateUser = async (id, data) => {
    try {
      setModalState((prev) => ({
        ...prev,
        formLoading: true,
        formError: null,
      }));

      console.log('Updating user with data:', data);
      
      // Update user
      const result = await updateUser(id, data);
      console.log('User updated:', result);
      
      // If role is provided, assign it
      if (data.role && data.role !== 'Sin rol') {
        await assignRoleToUser(id, data.role);
      }
      
      // Refresh users list
      const usersResponse = await getUsers();
      const usersData = usersResponse.users || [];
      const enrichedUsers = await Promise.all(
        usersData.map(async (user) => {
          try {
            const userRoles = await getUserRoles(user.id);
            console.log(`Roles for user ${user.id} after update:`, userRoles);
            
            // getUserRoles returns an array - could be role names or role objects
            let primaryRole = 'Sin rol';
            if (userRoles && userRoles.length > 0) {
              // Check if it's an array of strings or objects
              if (typeof userRoles[0] === 'string') {
                primaryRole = userRoles[0];
              } else if (userRoles[0] && userRoles[0].name) {
                primaryRole = userRoles[0].name;
              } else if (userRoles[0]) {
                primaryRole = userRoles[0].toString();
              }
            }
            
            return {
              ...user,
              role: primaryRole,
              roles: userRoles || []
            };
          } catch (err) {
            return {
              ...user,
              role: 'Sin rol',
              roles: []
            };
          }
        })
      );
      
      setUsers(enrichedUsers);
      setSuccess("Usuario actualizado exitosamente");
      closeModal();
      
    } catch (err) {
      console.error('Error updating user:', err);
      setModalState((prev) => ({
        ...prev,
        formError: err.message || "Error al actualizar usuario",
        formLoading: false,
      }));
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      console.log('Deleting user:', user);
      
      // Eliminar físicamente el usuario con tipo 'fisica'
      await deleteUser(user.id, 'fisica');
      
      // Refresh users list
      const usersResponse = await getUsers();
      const usersData = usersResponse.users || [];
      const enrichedUsers = await Promise.all(
        usersData.map(async (user) => {
          try {
            const userRoles = await getUserRoles(user.id);
            let primaryRole = 'Sin rol';
            if (userRoles && userRoles.length > 0) {
              if (typeof userRoles[0] === 'string') {
                primaryRole = userRoles[0];
              } else if (userRoles[0] && userRoles[0].name) {
                primaryRole = userRoles[0].name;
              } else if (userRoles[0]) {
                primaryRole = userRoles[0].toString();
              }
            }
            
            return {
              ...user,
              role: primaryRole,
              roles: userRoles || []
            };
          } catch (err) {
            return {
              ...user,
              role: 'Sin rol',
              roles: []
            };
          }
        })
      );
      
      setUsers(enrichedUsers);
      setSuccess("Usuario eliminado exitosamente");
      closeModal(); // Cerrar el modal después de eliminar
      
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || "Error al eliminar usuario");
    }
  };

  const openCreateModal = () =>
    setModalState({
      showModal: true,
      selectedUser: null,
      formLoading: false,
      formError: null,
    });

  const openEditModal = (user) => {
    console.log('Opening edit modal for user:', user);
    setModalState({
      showModal: true,
      selectedUser: user,
      formLoading: false,
      formError: null,
    });
  };

  const closeModal = () =>
    setModalState({
      showModal: false,
      selectedUser: null,
      formLoading: false,
      formError: null,
    });

  const handleFormSubmit = async (data) => {
    try {
      if (modalState.selectedUser) {
        await handleUpdateUser(modalState.selectedUser.id, data);
      } else {
        await handleCreateUser(data);
      }
    } catch (err) {
      console.error("Error in form submit:", err);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <MainContent>
      <div className="usuarios-page space-y-6">
        {error && <Alert type="error" message={error} onClose={clearMessages} />}
        {success && (
          <Alert type="success" message={success} onClose={clearMessages} />
        )}

        {isEditingMode && (
          <div className="mb-4">
            <Badge
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Edit3 className="w-5 h-5 mr-2" />
              Modo edición
            </Badge>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <UserList
              users={paginatedUsers}
              loading={loading}
              onAdd={openCreateModal}
              onEdit={openEditModal}
              currentPage={currentPage}
              totalPages={totalFilteredPages}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              isEditingMode={isEditingMode}
              searchQuery={searchQuery}
              onSearch={handleSearch}
              roles={roles}
            />
          </CardContent>
        </Card>

        <UserForm
          open={modalState.showModal}
          onOpenChange={(open) => {
            if (!open) closeModal();
          }}
          mode={modalState.selectedUser ? "edit" : "create"}
          initialData={modalState.selectedUser}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          onDelete={handleDeleteUser}
          loading={modalState.formLoading}
          error={modalState.formError}
          roles={roles}
        />
      </div>
    </MainContent>
  );
}

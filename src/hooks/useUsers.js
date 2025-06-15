// useUsers.js - Custom hook for user management
import { useState, useEffect, useCallback } from 'react';
import {
    getUsers,
    setUserActiveStatus,
    deleteUser,
    createUser,
    updateUser,
    blockUser,
    unblockUser,
    updateUserPassword,
    resetUserPasswordAdmin,
    checkEmailExists,
    setUserAvatar
} from '../services/userService';

export function useUsers(initialFilters = {}) {
    // State management
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [itemsPerPage] = useState(10);

    // Filters and search
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [filters, setFilters] = useState({
        role: '',
        isActive: '',
        ...initialFilters
    });

    // Load users data
    const loadUsers = useCallback(async (
        page = currentPage,
        search = searchQuery,
        sort = sortConfig,
        currentFilters = filters
    ) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                limit: itemsPerPage,
                search,
                sortBy: sort.key,
                sortDirection: sort.direction,
                ...currentFilters
            };

            const response = await getUsers(params);

            setUsers(response.users || []);
            setTotalPages(response.totalPages || 1);
            setTotalUsers(response.total || 0);
            setCurrentPage(response.currentPage || page);

        } catch (err) {
            console.error('Error loading users:', err);
            setError(err?.response?.data?.error || 'Error al cargar los usuarios');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, sortConfig, filters, itemsPerPage]);

    // Initialize data loading
    useEffect(() => {
        loadUsers(1, searchQuery, sortConfig, filters);
    }, [searchQuery, sortConfig, filters]);

    // Handle search
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    // Handle sorting
    const handleSort = useCallback((newSortConfig) => {
        setSortConfig(newSortConfig);
        setCurrentPage(1);
    }, []);

    // Handle pagination
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        loadUsers(page, searchQuery, sortConfig, filters);
    }, [loadUsers, searchQuery, sortConfig, filters]);

    // Handle filter changes
    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
        setCurrentPage(1);
    }, []);

    // Handle user status toggle
    const handleToggleUserStatus = useCallback(async (user) => {
        try {
            setError(null);
            await setUserActiveStatus(user.id, !user.isActive);

            // Update user in the local state
            setUsers(prevUsers =>
                prevUsers.map(u =>
                    u.id === user.id
                        ? { ...u, isActive: !u.isActive }
                        : u
                )
            );

            setSuccess(
                `Usuario ${user.isActive ? 'desactivado' : 'activado'} correctamente`
            );

        } catch (err) {
            console.error('Error toggling user status:', err);
            setError(err?.response?.data?.error || 'Error al cambiar el estado del usuario');
        }
    }, []);

    // Handle user deletion
    const handleDeleteUser = useCallback(async (user) => {
        try {
            setError(null);
            await deleteUser(user.id);

            // Remove user from local state
            setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
            setTotalUsers(prevTotal => prevTotal - 1);

            setSuccess('Usuario eliminado correctamente');

        } catch (err) {
            console.error('Error deleting user:', err);
            setError(err?.response?.data?.error || 'Error al eliminar el usuario');
        }
    }, []);

    // Handle user creation
    const handleCreateUser = useCallback(async (userData) => {
        try {
            setError(null);
            const newUser = await createUser(userData);

            // Add new user to local state
            setUsers(prevUsers => [newUser, ...prevUsers]);
            setTotalUsers(prevTotal => prevTotal + 1);

            setSuccess('Usuario creado correctamente');
            return newUser;

        } catch (err) {
            console.error('Error creating user:', err);
            setError(err?.response?.data?.error || 'Error al crear el usuario');
            throw err;
        }
    }, []);

    // Handle user update
    const handleUpdateUser = useCallback(async (userId, userData) => {
        try {
            setError(null);
            const updatedUser = await updateUser(userId, userData);

            // Update user in local state
            setUsers(prevUsers =>
                prevUsers.map(u =>
                    u.id === userId ? updatedUser : u
                )
            );

            setSuccess('Usuario actualizado correctamente');
            return updatedUser;

        } catch (err) {
            console.error('Error updating user:', err);
            setError(err?.response?.data?.error || 'Error al actualizar el usuario');
            throw err;
        }
    }, []);

    // Handle user blocking
    const handleBlockUser = useCallback(async (user) => {
        try {
            setError(null);
            await blockUser(user.id);

            // Update user in local state
            setUsers(prevUsers =>
                prevUsers.map(u =>
                    u.id === user.id ? { ...u, isBlocked: true } : u
                )
            );

            setSuccess('Usuario bloqueado correctamente');

        } catch (err) {
            console.error('Error blocking user:', err);
            setError(err?.response?.data?.error || 'Error al bloquear el usuario');
        }
    }, []);

    // Handle user unblocking
    const handleUnblockUser = useCallback(async (user) => {
        try {
            setError(null);
            await unblockUser(user.id);

            // Update user in local state
            setUsers(prevUsers =>
                prevUsers.map(u =>
                    u.id === user.id ? { ...u, isBlocked: false } : u
                )
            );

            setSuccess('Usuario desbloqueado correctamente');

        } catch (err) {
            console.error('Error unblocking user:', err);
            setError(err?.response?.data?.error || 'Error al desbloquear el usuario');
        }
    }, []);

    // Handle password update
    const handleUpdatePassword = useCallback(async (userId, passwordData) => {
        try {
            setError(null);
            await updateUserPassword(userId, passwordData);
            setSuccess('Contraseña actualizada correctamente');

        } catch (err) {
            console.error('Error updating password:', err);
            setError(err?.response?.data?.error || 'Error al actualizar la contraseña');
            throw err;
        }
    }, []);

    // Handle admin password reset
    const handleResetPassword = useCallback(async (userId, newPassword) => {
        try {
            setError(null);
            await resetUserPasswordAdmin(userId, newPassword);
            setSuccess('Contraseña restablecida correctamente');

        } catch (err) {
            console.error('Error resetting password:', err);
            setError(err?.response?.data?.error || 'Error al restablecer la contraseña');
            throw err;
        }
    }, []);

    // Handle avatar update
    const handleUpdateAvatar = useCallback(async (userId, avatarData) => {
        try {
            setError(null);
            const updatedUser = await setUserAvatar(userId, avatarData);

            // Update user in local state
            setUsers(prevUsers =>
                prevUsers.map(u =>
                    u.id === userId ? { ...u, avatar: updatedUser.avatar } : u
                )
            );

            setSuccess('Avatar actualizado correctamente');
            return updatedUser;

        } catch (err) {
            console.error('Error updating avatar:', err);
            setError(err?.response?.data?.error || 'Error al actualizar el avatar');
            throw err;
        }
    }, []);

    // Check if email exists
    const handleCheckEmailExists = useCallback(async (email) => {
        try {
            const result = await checkEmailExists(email);
            return result.exists;

        } catch (err) {
            console.error('Error checking email:', err);
            return false;
        }
    }, []);

    // Clear messages
    const clearMessages = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    // Refresh data
    const refreshUsers = useCallback(() => {
        loadUsers(currentPage, searchQuery, sortConfig, filters);
    }, [loadUsers, currentPage, searchQuery, sortConfig, filters]);

    // Reset filters
    const resetFilters = useCallback(() => {
        setFilters({
            role: '',
            isActive: '',
            ...initialFilters
        });
        setSearchQuery('');
        setSortConfig({ key: 'createdAt', direction: 'desc' });
        setCurrentPage(1);
    }, [initialFilters]);

    return {
        // State
        users,
        loading,
        error,
        success,

        // Pagination
        currentPage,
        totalPages,
        totalUsers,
        itemsPerPage,

        // Filters and search
        searchQuery,
        sortConfig,
        filters,

        // Basic Actions
        handleSearch,
        handleSort,
        handlePageChange,
        handleFilterChange,
        handleToggleUserStatus,
        handleDeleteUser,
        handleCreateUser,
        handleUpdateUser,

        // Advanced User Actions
        handleBlockUser,
        handleUnblockUser,
        handleUpdatePassword,
        handleResetPassword,
        handleUpdateAvatar,
        handleCheckEmailExists,

        // Utilities
        clearMessages,
        refreshUsers,
        resetFilters,
        loadUsers
    };
} 
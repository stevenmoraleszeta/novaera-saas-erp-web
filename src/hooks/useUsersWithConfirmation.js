// useUsersWithConfirmation.js - Hook that combines user operations with confirmation modals
import { useCallback } from 'react';
import { useUsers } from './useUsers';
import { useConfirmationModal } from './useModal';

export function useUsersWithConfirmation(initialFilters = {}) {
    // Base users hook
    const usersHook = useUsers(initialFilters);

    // Confirmation modal hook  
    const confirmationModal = useConfirmationModal();

    // Enhanced toggle status with confirmation
    const handleToggleUserStatusWithConfirmation = useCallback((user, skipConfirmation = false) => {
        if (skipConfirmation) {
            return usersHook.handleToggleUserStatus(user);
        }

        const action = user.isActive ? 'desactivar' : 'activar';
        const actionCapitalized = user.isActive ? 'Desactivar' : 'Activar';

        confirmationModal.openConfirmation({
            title: `${actionCapitalized} Usuario`,
            message: `¿Estás seguro de que deseas ${action} a ${user.name}? ${user.isActive
                ? 'El usuario no podrá acceder al sistema.'
                : 'El usuario podrá acceder al sistema nuevamente.'
                }`,
            confirmText: `Sí, ${action}`,
            cancelText: 'Cancelar',
            type: user.isActive ? 'warning' : 'default',
            onConfirm: async () => {
                try {
                    console.log('Toggling user status:', user.id, 'to', !user.isActive);
                    await usersHook.handleToggleUserStatus(user);
                } catch (error) {
                    console.error('Error toggling user status:', error);
                    throw error;
                }
            }
        });
    }, [usersHook, confirmationModal]);

    // Enhanced block user with confirmation
    const handleBlockUserWithConfirmation = useCallback((user, skipConfirmation = false) => {
        if (skipConfirmation) {
            return usersHook.handleBlockUser(user);
        }

        confirmationModal.openConfirmation({
            title: 'Bloquear Usuario',
            message: `¿Estás seguro de que deseas bloquear a ${user.name}? El usuario no podrá acceder al sistema hasta ser desbloqueado.`,
            confirmText: 'Sí, bloquear',
            cancelText: 'Cancelar',
            type: 'danger',
            onConfirm: async () => {
                try {
                    console.log('Blocking user:', user.id);
                    await usersHook.handleBlockUser(user);
                } catch (error) {
                    console.error('Error blocking user:', error);
                    throw error;
                }
            }
        });
    }, [usersHook, confirmationModal]);

    // Enhanced unblock user with confirmation
    const handleUnblockUserWithConfirmation = useCallback((user, skipConfirmation = false) => {
        if (skipConfirmation) {
            return usersHook.handleUnblockUser(user);
        }

        confirmationModal.openConfirmation({
            title: 'Desbloquear Usuario',
            message: `¿Estás seguro de que deseas desbloquear a ${user.name}? El usuario podrá acceder al sistema nuevamente.`,
            confirmText: 'Sí, desbloquear',
            cancelText: 'Cancelar',
            type: 'default',
            onConfirm: async () => {
                try {
                    console.log('Unblocking user:', user.id);
                    await usersHook.handleUnblockUser(user);
                } catch (error) {
                    console.error('Error unblocking user:', error);
                    throw error;
                }
            }
        });
    }, [usersHook, confirmationModal]);

    // Enhanced delete user with confirmation
    const handleDeleteUserWithConfirmation = useCallback((user, skipConfirmation = false) => {
        if (skipConfirmation) {
            return usersHook.handleDeleteUser(user);
        }

        confirmationModal.openConfirmation({
            title: 'Eliminar Usuario',
            message: `¿Estás seguro de que deseas eliminar a ${user.name}? Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger',
            onConfirm: async () => {
                try {
                    console.log('Deleting user:', user.id);
                    await usersHook.handleDeleteUser(user);
                } catch (error) {
                    console.error('Error deleting user:', error);
                    throw error;
                }
            }
        });
    }, [usersHook, confirmationModal]);

    // Enhanced create user (no confirmation needed)
    const handleCreateUserEnhanced = useCallback(async (userData) => {
        try {
            console.log('Creating user with data:', userData);
            const result = await usersHook.handleCreateUser(userData);
            console.log('User created successfully:', result);
            return result;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }, [usersHook]);

    // Enhanced update user (no confirmation needed)
    const handleUpdateUserEnhanced = useCallback(async (userId, userData) => {
        try {
            console.log('Updating user:', userId, 'with data:', userData);
            const result = await usersHook.handleUpdateUser(userId, userData);
            console.log('User updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }, [usersHook]);

    return {
        // All original useUsers functionality
        ...usersHook,

        // Enhanced methods with confirmation
        handleToggleUserStatus: handleToggleUserStatusWithConfirmation,
        handleBlockUser: handleBlockUserWithConfirmation,
        handleUnblockUser: handleUnblockUserWithConfirmation,
        handleDeleteUser: handleDeleteUserWithConfirmation,
        handleCreateUser: handleCreateUserEnhanced,
        handleUpdateUser: handleUpdateUserEnhanced,

        // Direct methods (no confirmation needed)
        handleGetUserById: usersHook.handleGetUserById,

        // Confirmation modal state and methods
        confirmationModal: {
            isOpen: confirmationModal.isOpen,
            confirmationData: confirmationModal.confirmationData,
            openConfirmation: confirmationModal.openConfirmation,
            closeConfirmation: confirmationModal.closeConfirmation,
            handleConfirm: confirmationModal.handleConfirm,
            handleCancel: confirmationModal.handleCancel
        }
    };
} 
// useModal.js - Custom hook for modal management
import { useState, useCallback } from 'react';

export function useModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    const openModal = useCallback((data = null) => {
        setModalData(data);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setModalData(null);
    }, []);

    const toggleModal = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    return {
        isOpen,
        modalData,
        openModal,
        closeModal,
        toggleModal
    };
}

export function useConfirmationModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmationData, setConfirmationData] = useState({
        title: '',
        message: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        type: 'default', // 'default', 'danger', 'warning'
        onConfirm: null,
        onCancel: null,
        loading: false
    });

    const openConfirmation = useCallback(({
        title,
        message,
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        type = 'default',
        onConfirm = null,
        onCancel = null
    }) => {
        setConfirmationData({
            title,
            message,
            confirmText,
            cancelText,
            type,
            onConfirm,
            onCancel,
            loading: false
        });
        setIsOpen(true);
    }, []);

    const closeConfirmation = useCallback(() => {
        if (confirmationData.loading) return; // No cerrar si está cargando

        setIsOpen(false);
        // Limpiar datos después de cerrar para evitar flash
        setTimeout(() => {
            setConfirmationData({
                title: '',
                message: '',
                confirmText: 'Confirmar',
                cancelText: 'Cancelar',
                type: 'default',
                onConfirm: null,
                onCancel: null,
                loading: false
            });
        }, 300);
    }, [confirmationData.loading]);

    const handleConfirm = useCallback(async () => {
        if (!confirmationData.onConfirm || confirmationData.loading) return;

        try {
            setConfirmationData(prev => ({ ...prev, loading: true }));
            await confirmationData.onConfirm();
            closeConfirmation();
        } catch (error) {
            console.error('Error in confirmation handler:', error);
            // Mantener modal abierto en caso de error para que el usuario vea el mensaje
            setConfirmationData(prev => ({ ...prev, loading: false }));
        }
    }, [confirmationData, closeConfirmation]);

    const handleCancel = useCallback(() => {
        if (confirmationData.loading) return;

        if (confirmationData.onCancel) {
            confirmationData.onCancel();
        }
        closeConfirmation();
    }, [confirmationData, closeConfirmation]);

    return {
        isOpen,
        confirmationData,
        openConfirmation,
        closeConfirmation,
        handleConfirm,
        handleCancel
    };
} 
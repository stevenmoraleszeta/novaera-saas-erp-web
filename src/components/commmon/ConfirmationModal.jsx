// ConfirmationModal.jsx - Reusable confirmation modal component
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { PiWarningBold, PiQuestionBold, PiTrashBold } from 'react-icons/pi';

/**
 * Props:
 *  - isOpen: boolean
 *  - onClose: function
 *  - title: string
 *  - message: string
 *  - confirmText: string (default: 'Confirmar')
 *  - cancelText: string (default: 'Cancelar')
 *  - type: 'default' | 'danger' | 'warning' (default: 'default')
 *  - onConfirm: function
 *  - onCancel: function
 *  - loading: boolean (default: false)
 */
export default function ConfirmationModal({
    isOpen,
    onClose,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'default',
    onConfirm,
    onCancel,
    loading = false
}) {
    const handleConfirm = () => {
        if (onConfirm && !loading) {
            onConfirm();
        }
    };

    const handleCancel = () => {
        if (loading) return;

        if (onCancel) {
            onCancel();
        } else {
            onClose();
        }
    };

    // Prevent closing modal when loading
    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    // Get icon based on type
    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <PiTrashBold className="modal-icon danger" />;
            case 'warning':
                return <PiWarningBold className="modal-icon warning" />;
            default:
                return <PiQuestionBold className="modal-icon default" />;
        }
    };

    // Get confirm button variant based on type
    const getConfirmVariant = () => {
        switch (type) {
            case 'danger':
                return 'danger';
            case 'warning':
                return 'primary';
            default:
                return 'primary';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="small"
            closeOnOverlayClick={!loading}
            showCloseButton={!loading}
        >
            <div className="confirmation-modal">
                {/* Icon */}
                <div className="modal-icon-container">
                    {getIcon()}
                </div>

                {/* Content */}
                <div className="modal-content">
                    {title && <h3 className="modal-title">{title}</h3>}
                    {message && <p className="modal-message">{message}</p>}
                </div>

                {/* Actions */}
                <div className="modal-actions">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={getConfirmVariant()}
                        onClick={handleConfirm}
                        disabled={loading}
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>

            <style jsx>{`
        .confirmation-modal {
          padding: 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .modal-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          margin-bottom: 0.5rem;
        }

        .modal-icon {
          font-size: 2rem;
        }

        .modal-icon.default {
          color: var(--primary-green, #7ed957);
          background: rgba(126, 217, 87, 0.1);
          border-radius: 50%;
          padding: 1rem;
        }

        .modal-icon.warning {
          color: var(--warning, #f59e0b);
          background: rgba(245, 158, 11, 0.1);
          border-radius: 50%;
          padding: 1rem;
        }

        .modal-icon.danger {
          color: var(--danger, #ef4444);
          background: rgba(239, 68, 68, 0.1);
          border-radius: 50%;
          padding: 1rem;
        }

        .modal-content {
          max-width: 100%;
        }

        .modal-title {
          margin: 0 0 0.75rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary, #111827);
          line-height: 1.3;
        }

        .modal-message {
          margin: 0;
          color: var(--text-secondary, #6b7280);
          font-size: 0.95rem;
          line-height: 1.5;
          max-width: 90%;
          margin: 0 auto;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          width: 100%;
          margin-top: 0.5rem;
        }

        /* Responsive design */
        @media (max-width: 480px) {
          .confirmation-modal {
            padding: 1.5rem;
            gap: 1.25rem;
          }

          .modal-icon-container {
            width: 3.5rem;
            height: 3.5rem;
          }

          .modal-icon {
            font-size: 1.75rem;
          }

          .modal-title {
            font-size: 1.125rem;
          }

          .modal-message {
            font-size: 0.9rem;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .modal-actions :global(button) {
            width: 100%;
          }
        }

        /* Loading state */
        .confirmation-modal:global(.loading) {
          pointer-events: none;
        }

        /* Animation */
        .modal-icon-container {
          animation: modalIconScale 0.3s ease-out;
        }

        @keyframes modalIconScale {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
        </Modal>
    );
} 
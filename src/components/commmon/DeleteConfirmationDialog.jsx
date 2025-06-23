import React from 'react';
import Modal from '../commmon/Modal';
import Button from './Button';

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  loading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="small" showCloseButton>
      <div className="dialog">
        <h3 className="dialog-title">{title}</h3>
        <p className="dialog-message">{message}</p>

        <div className="dialog-actions">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando...' : confirmText}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .dialog {
          padding: 1.5rem;
          text-align: center;
        }

        .dialog-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .dialog-message {
          color: #4b5563;
          margin-bottom: 1.5rem;
        }

        .dialog-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
      `}</style>
    </Modal>
  );
}

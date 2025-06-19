// Modal.jsx - Reusable modal component
import React, { useEffect } from 'react';
import { PiXBold } from 'react-icons/pi';

/**
 * Props:
 *  - isOpen: boolean
 *  - onClose: function
 *  - title: string (optional)
 *  - size: 'small' | 'medium' | 'large' | 'full' (default: 'medium')
 *  - children: ReactNode
 *  - closeOnOverlayClick: boolean (default: true)
 *  - showCloseButton: boolean (default: true)
 */
export default function Modal({
    isOpen,
    onClose,
    title,
    size = 'medium',
    children,
    closeOnOverlayClick = true,
    showCloseButton = true
}) {
    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    // Handle overlay click
    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`modal-overlay ${size}`} onClick={handleOverlayClick}>
            <div className="modal-content" role="dialog" aria-modal="true">
                {/* Modal Header */}
                {(title || showCloseButton) && (
                    <div className="modal-header">
                        {title && <h2 className="modal-title">{title}</h2>}
                        {showCloseButton && (
                            <button
                                className="modal-close"
                                onClick={onClose}
                                aria-label="Cerrar modal"
                                title="Cerrar"
                            >
                                <PiXBold />
                            </button>
                        )}
                    </div>
                )}

                {/* Modal Body */}
                <div className="modal-body">
                    {children}
                </div>
            </div>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.18); /* más suave para tema claro */
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          backdrop-filter: blur(2px);
          animation: modalFadeIn 0.2s ease-out;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: var(--background, #fff);
          border-radius: 0.75rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03);
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: modalSlideIn 0.3s ease-out;
          position: relative;
        }

        @keyframes modalSlideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Modal sizes */
        .modal-overlay.small .modal-content {
          width: 100%;
          max-width: 400px;
        }

        .modal-overlay.medium .modal-content {
          width: 100%;
          max-width: 600px;
        }

        .modal-overlay.large .modal-content {
          width: 100%;
          max-width: 900px;
        }

        .modal-overlay.full .modal-content {
          width: 95%;
          max-width: 1200px;
          height: 90vh;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border, #e0e0e0);
          background: var(--secondary, #f5f5f5);
        }

        .modal-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--foreground, #171717);
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--foreground, #171717);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--primary, #0070f3);
        }

        .modal-close:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 0.5rem;
          }

          .modal-overlay.small .modal-content,
          .modal-overlay.medium .modal-content,
          .modal-overlay.large .modal-content {
            width: 100%;
            max-width: none;
          }

          .modal-overlay.full .modal-content {
            width: 100%;
            height: 95vh;
          }

          .modal-header {
            padding: 1rem 1.5rem;
          }

          .modal-title {
            font-size: 1.125rem;
          }
        }
      `}</style>
        </div>
    );
}
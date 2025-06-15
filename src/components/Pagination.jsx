import React from 'react';
import { PiCaretLeftBold, PiCaretRightBold, PiCaretDoubleLeftBold, PiCaretDoubleRightBold } from 'react-icons/pi';

export default function Pagination({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange,
    showItemsCount = true,
    maxVisiblePages = 5
}) {
    // Calculate visible page range
    const getVisiblePages = () => {
        const delta = Math.floor(maxVisiblePages / 2);
        let start = Math.max(1, currentPage - delta);
        let end = Math.min(totalPages, start + maxVisiblePages - 1);

        // Adjust start if we're near the end
        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const visiblePages = getVisiblePages();
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) return null;

    return (
        <div className="pagination-container">
            {showItemsCount && (
                <div className="items-info">
                    Mostrando {startItem}-{endItem} de {totalItems} usuarios
                </div>
            )}

            <div className="pagination">
                {/* First page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="page-button nav-button"
                    title="Primera página"
                >
                    <PiCaretDoubleLeftBold />
                </button>

                {/* Previous page */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="page-button nav-button"
                    title="Página anterior"
                >
                    <PiCaretLeftBold />
                </button>

                {/* Page numbers */}
                {visiblePages[0] > 1 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className="page-button number-button"
                        >
                            1
                        </button>
                        {visiblePages[0] > 2 && <span className="ellipsis">...</span>}
                    </>
                )}

                {visiblePages.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`page-button number-button ${page === currentPage ? 'active' : ''}`}
                    >
                        {page}
                    </button>
                ))}

                {visiblePages[visiblePages.length - 1] < totalPages && (
                    <>
                        {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                            <span className="ellipsis">...</span>
                        )}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            className="page-button number-button"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Next page */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="page-button nav-button"
                    title="Página siguiente"
                >
                    <PiCaretRightBold />
                </button>

                {/* Last page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="page-button nav-button"
                    title="Última página"
                >
                    <PiCaretDoubleRightBold />
                </button>
            </div>

            <style jsx>{`
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5em;
          gap: 1em;
        }
        
        .items-info {
          color: #6b7280;
          font-size: 0.9em;
          font-weight: 500;
        }
        
        .pagination {
          display: flex;
          align-items: center;
          gap: 0.3em;
        }
        
        .page-button {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 2.2em;
          height: 2.2em;
          border: 1px solid #e5e7eb;
          background: white;
          color: #374151;
          font-size: 0.9em;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }
        
        .page-button:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #d1d5db;
          transform: translateY(-1px);
        }
        
        .page-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }
        
        .nav-button {
          padding: 0;
        }
        
        .number-button {
          padding: 0 0.1em;
        }
        
        .page-button.active {
          background: #7ed957;
          border-color: #7ed957;
          color: white;
          box-shadow: 0 2px 4px rgba(126, 217, 87, 0.3);
        }
        
        .page-button.active:hover {
          background: #6bb946;
          border-color: #6bb946;
          transform: translateY(-1px);
        }
        
        .ellipsis {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 2.2em;
          height: 2.2em;
          color: #9ca3af;
          font-weight: bold;
          user-select: none;
        }
        
        @media (max-width: 768px) {
          .pagination-container {
            flex-direction: column;
            gap: 0.8em;
          }
          
          .items-info {
            font-size: 0.8em;
          }
          
          .page-button {
            min-width: 2em;
            height: 2em;
            font-size: 0.8em;
          }
          
          .pagination {
            gap: 0.2em;
          }
        }
        
        @media (max-width: 480px) {
          .pagination {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
        </div>
    );
} 
import React from 'react';

export default function UserStatusBadge({ isActive, size = 'medium' }) {
    const sizeClasses = {
        small: 'badge-small',
        medium: 'badge-medium',
        large: 'badge-large'
    };

    return (
        <span className={`badge ${isActive ? 'active' : 'inactive'} ${sizeClasses[size]}`}>
            <span className="indicator"></span>
            {isActive ? 'Activo' : 'Inactivo'}

            <style jsx>{`
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4em;
          font-weight: 500;
          border-radius: 20px;
          text-transform: capitalize;
          letter-spacing: 0.3px;
          transition: all 0.2s ease;
        }
        
        .badge-small {
          padding: 0.25em 0.7em;
          font-size: 0.75em;
        }
        
        .badge-medium {
          padding: 0.4em 0.9em;
          font-size: 0.85em;
        }
        
        .badge-large {
          padding: 0.5em 1.1em;
          font-size: 0.95em;
        }
        
        .indicator {
          width: 0.6em;
          height: 0.6em;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .active {
          background: linear-gradient(135deg, #d4f2cb 0%, #e8f8e5 100%);
          color: #2d5a27;
          border: 1px solid #7ed95744;
        }
        
        .active .indicator {
          background: #7ed957;
          box-shadow: 0 0 0 2px rgba(126, 217, 87, 0.2);
        }
        
        .inactive {
          background: linear-gradient(135deg, #f3f3f3 0%, #fafafa 100%);
          color: #666;
          border: 1px solid #e0e0e0;
        }
        
        .inactive .indicator {
          background: #bbb;
          box-shadow: 0 0 0 2px rgba(187, 187, 187, 0.2);
        }
        
        .badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      `}</style>
        </span>
    );
} 
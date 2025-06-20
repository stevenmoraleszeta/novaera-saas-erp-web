import React from 'react';

export default function NotificationStatusBadge({ isRead, size = 'medium' }) {
  const sizeClasses = {
    small: 'badge-small',
    medium: 'badge-medium',
    large: 'badge-large'
  };

  return (
    <span className={`badge ${isRead ? 'read' : 'unread'} ${sizeClasses[size]}`}>
      <span className="indicator"></span>
      {isRead ? 'Leída' : 'No leída'}

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

        .read {
          background: linear-gradient(135deg, #e0f0ff 0%, #f0f9ff 100%);
          color: #2563eb;
          border: 1px solid #93c5fd;
        }

        .read .indicator {
          background: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .unread {
          background: linear-gradient(135deg, #fef3c7 0%, #fff7ed 100%);
          color: #92400e;
          border: 1px solid #facc15;
        }

        .unread .indicator {
          background: #f59e0b;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
        }

        .badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
      `}</style>
    </span>
  );
}

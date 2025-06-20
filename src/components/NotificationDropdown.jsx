import React from 'react';
import Link from 'next/link';

export default function NotificationDropdown({
  notifications = [],
  onClose,
  onViewAll,
  onMarkAllAsRead
}) {
  return (
    <div className="dropdown">
      <div className="header">
        <span>Notificaciones</span>
        <button className="mark-all" onClick={onMarkAllAsRead}>Marcar todas como leídas</button>
      </div>

      <div className="list">
        {notifications.length === 0 ? (
          <div className="empty">No hay notificaciones nuevas</div>
        ) : (
          notifications.filter(n => !n.read).slice(0, 5).map((n, index) => (
            <div key={index} className={`item ${n.read ? '' : 'unread'}`}>
              <strong>{n.title}</strong>
              <p>{n.message}</p>
              {n.link_to_module && (
                <a href={n.link_to_module}>Ver módulo</a>
              )}
            </div>
          ))
        )}
      </div>

      <div className="footer">
        <a href="/notificaciones" className="view-all-link">
          Ver todas
        </a>

      </div>

      <style jsx>{`

        .view-all-link {
          display: inline-block;
          color:rgb(0, 0, 0);
          font-weight: bold;
          padding: 0.5rem 1rem;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .view-all-link:hover {
          color: #6bb946;
        }

        .dropdown {
          position: absolute;
          top: 40px;
          right: 0;
          width: 320px;
          background: white;
          border: 1px solid #ccc;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1000;
        }

        .header {
          padding: 0.75rem 1rem;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e5e5;
        }

        .mark-all {
          background: none;
          border: none;
          color: #7ed957;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .list {
          max-height: 250px;
          overflow-y: auto;
        }

        .item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #eee;
        }

        .item.unread {
          background: #f9f9f9;
        }

        .item strong {
          display: block;
          color: #111;
        }

        .item p {
          margin: 0.25rem 0;
          color: #555;
          font-size: 0.9rem;
        }

        .item a {
          font-size: 0.85rem;
          color: #2563eb;
          text-decoration: underline;
        }

        .empty {
          padding: 1rem;
          text-align: center;
          color: #777;
        }

        .footer {
          padding: 0.5rem 1rem;
          border-top: 1px solid #e5e5e5;
          text-align: center;
        }

        .view-all {
          background: none;
          border: none;
          color: #7ed957;
          font-weight: bold;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

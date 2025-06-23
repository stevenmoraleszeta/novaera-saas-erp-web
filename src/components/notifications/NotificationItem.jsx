// components/NotificationItem.jsx
import React from 'react';
import NotificationStatusBadge from '../ui/NotificationStatusBadge';

export default function NotificationItem({ notification }) {
  if (!notification) return null;

  const { title, message, read, created_at, link_to_module } = notification;

  return (
    <div className="notification-item">
      <div className="section">
        <strong>Título:</strong>
        <p>{title}</p>
      </div>

      <div className="section">
        <strong>Mensaje:</strong>
        <p>{message}</p>
      </div>

      <div className="section">
        <strong>Estado:</strong>
        <p>{read ? 'Leída' : 'No leída'}</p>
      </div>

    <div className="section">
    <strong>Estado:  </strong>
    <NotificationStatusBadge isRead={read} size="medium" />
    </div>

      {link_to_module && (
        <div className="section">
          <strong>Enlace:</strong>
          <a href={link_to_module} target="_blank" rel="noopener noreferrer">
            Ir al módulo
          </a>
        </div>
      )}

      <style jsx>{`
        .notification-item {
          padding: 1.5rem 2rem;
        }

        .section {
          margin-bottom: 1rem;
        }

        .section p {
          margin: 0.25rem 0 0 0;
        }

        a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

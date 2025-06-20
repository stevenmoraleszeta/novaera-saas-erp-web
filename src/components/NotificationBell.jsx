import React from 'react';
import { PiBell, PiBellFill } from 'react-icons/pi';

export default function NotificationBell({ unreadCount = 0, onClick }) {
  const hasUnread = unreadCount > 0;

  return (
    <div className="notification-bell" onClick={onClick}>
      {hasUnread ? (
        <PiBellFill size={24} />
      ) : (
        <PiBell size={24} />
      )}
      {hasUnread && (
        <span className="badge">{unreadCount}</span>
      )}

      <style jsx>{`
        .notification-bell {
          position: relative;
          display: inline-block;
          cursor: pointer;
        }
        .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background-color: red;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 12px;
          font-weight: bold;
          line-height: 1;
        }
      `}</style>
    </div>
  );
}

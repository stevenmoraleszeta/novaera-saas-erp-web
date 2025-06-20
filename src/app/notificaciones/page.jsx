'use client';

import React, { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import Table from '@/components/Table';

export default function NotificationCenterPage() {
  const { user } = useContext(AuthContext);
  const {
    notifications,
    handleSearch,
    handleMarkAsRead,
    handleMarkAllAsRead,
    fetchNotifications,
    loading,
  } = useNotifications(user?.id);

  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const columns = [
    { key: 'title', header: 'Título' },
    { key: 'message', header: 'Mensaje' },
    {
      key: 'read',
      header: 'Estado',
      render: (value) => (value ? 'Leída' : 'No leída'),
    },
    { key: 'created_at', header: 'Fecha' },
  ];

  const onRowClick = async (notif) => {
    if (!notif.read) await handleMarkAsRead(notif.id);
  };

  return (
    <div className="page-container">
      <h1>Centro de Notificaciones</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Buscar notificaciones..."
          onChange={(e) => handleSearch(e.target.value)}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todas</option>
          <option value="unread">No leídas</option>
          <option value="read">Leídas</option>
        </select>

        <button onClick={handleMarkAllAsRead}>Marcar todas como leídas</button>
      </div>

      <Table
        columns={columns.map((col) =>
          col.render
            ? { ...col, render: (row) => col.render(row[col.key]) }
            : col
        )}
        data={filteredNotifications}
        onRowClick={onRowClick}
      />

      <style jsx>{`
        .page-container {
          padding: 2rem;
        }

        .controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          align-items: center;
        }

        input {
          flex: 1;
          padding: 0.5rem 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        select, button {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          border: 1px solid #ccc;
        }

        button {
          background: #7ed957;
          color: white;
          border: none;
        }

        button:hover {
          background: #6bb946;
        }
      `}</style>
    </div>
  );
}

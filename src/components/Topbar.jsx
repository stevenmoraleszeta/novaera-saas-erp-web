// Topbar.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { PiUserCircleBold, PiSignOutBold } from 'react-icons/pi';

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="topbar">
      <div className="system-name">
        <img src="/globe.svg" alt="ERP Logo" className="logo" />
        <span>ERP System</span>
      </div>
      <div className="user-info">
        <span className="user-avatar">
          <PiUserCircleBold size={28} />
        </span>
        <span className="user-name">{user?.name || 'Usuario'}</span>
        <button className="btn-logout" onClick={logout} title="Cerrar sesión">
          <PiSignOutBold size={22} />
        </button>
      </div>
      <style jsx>{`
        .topbar {
          width: 100%;
          height: 64px;
          background: linear-gradient(90deg, #232526 60%, #7ed957 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5em 0 240px;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 20;
          box-shadow: 0 2px 16px 0 rgba(0,0,0,0.08);
          border-bottom: 1.5px solid #232526;
        }
        .system-name {
          display: flex;
          align-items: center;
          font-size: 1.45em;
          font-weight: 700;
          letter-spacing: 0.5px;
          gap: 0.7em;
        }
        .logo {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          background: #fff;
          object-fit: contain;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.7em;
          background: rgba(255,255,255,0.07);
          border-radius: 2em;
          padding: 0.3em 1.1em 0.3em 0.7em;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .user-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          color: #7ed957;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.08);
        }
        .user-name {
          font-weight: 500;
          font-size: 1.08em;
          margin: 0 0.5em 0 0.2em;
          color: #fff;
          letter-spacing: 0.2px;
        }
        .btn-logout {
          background: transparent;
          border: none;
          color: #fff;
          border-radius: 50%;
          padding: 0.3em 0.4em;
          cursor: pointer;
          transition: background 0.18s;
          display: flex;
          align-items: center;
        }
        .btn-logout:hover {
          background: rgba(255,255,255,0.18);
          color: #e53935;
        }
      `}</style>
    </header>
  );
}

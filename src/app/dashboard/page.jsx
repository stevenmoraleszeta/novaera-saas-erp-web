'use client';

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getUsers } from '../../services/userService';
import MainContent from '../../components/MainContent';
import { PiChartBarBold, PiUsersBold, PiGearSixBold, PiBellBold , PiShieldStarBold} from 'react-icons/pi';

export default function DashboardPage() {
  const { user, status } = useContext(AuthContext);
  
  // Estados para las estadísticas
  const [stats, setStats] = useState({
    totalUsers: 0,
    loading: true,

    lastUpdated: null
  });

  // Cargar estadísticas de usuarios
  useEffect(() => {
    const loadStats = async () => {
      if (status === 'authenticated') {
        try {
          setStats(prev => ({ ...prev, loading: true }));

          // Obtener todos los usuarios para calcular estadísticas
          const response = await getUsers({ limit: 1000 }); // Obtener muchos para contar todos
          const users = response.users || [];

          setStats({
            totalUsers: response.total || users.length,
            loading: false,
            lastUpdated: new Date()
          });

        } catch (error) {
          console.error('Error loading stats:', error);
          setStats(prev => ({ ...prev, loading: false }));
        }
      }
    };

    loadStats();
  }, [status]);

  if (status === 'authenticating') {
    return (
      <MainContent>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Cargando dashboard...</span>
          <style jsx>{`
            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 50vh;
              color: #6b7280;
            }
            .loading-spinner {
              width: 2em;
              height: 2em;
              border: 3px solid #f3f4f6;
              border-top: 3px solid #7ed957;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 1em;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <div className="dashboard">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Bienvenido al Sistema ERP</h1>
            <p>Hola <strong>{user?.name || user?.email}</strong>, aquí tienes un resumen de tu sistema.</p>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Usuario'}</span>
              <span className="user-role">{user?.role || 'Usuario'}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <PiUsersBold />
            </div>
            <div className="stat-content">
              <span className="stat-number">
                {stats.loading ? (
                  <div className="stat-loading">...</div>
                ) : (
                  stats.totalUsers
                )}
              </span>
              <span className="stat-label">Usuarios Totales</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon charts">
              <PiChartBarBold />
            </div>
            <div className="stat-content">
              <span className="stat-number">0</span>
              <span className="stat-label">Reportes Generados</span>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        {stats.lastUpdated && (
          <div className="stats-footer">
            <span className="last-updated">
              Última actualización: {stats.lastUpdated.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <button
              onClick={() => window.location.reload()}
              className="refresh-button"
              title="Actualizar estadísticas"
            >
              🔄 Actualizar
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Acciones Rápidas</h2>
          <div className="actions-grid">
            <a href="/usuarios" className="action-card">
              <PiUsersBold className="action-icon" />
              <div className="action-content">
                <h3>Gestionar Usuarios</h3>
                <p>Administra usuarios del sistema</p>
              </div>
            </a>
            <a href="/roles" className="action-card">
              <PiShieldStarBold className="action-icon" />
              <div className="action-content">
                <h3>Gestionar Roles</h3>
                <p>Administra Roles del sistema</p>
              </div>
            </a>
          </div>
        </div>
      </div>
      <style jsx>{`
        .dashboard {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .welcome-section {
          background: var(--primary, #fff);
          color: var(--foreground, #171717);
          padding: 1.5em 2em;
          border-radius: 14px;
          margin-bottom: 2em;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 12px 0 rgba(126,217,87,0.08);
        }

        .welcome-content h1 {
          margin: 0 0 0.5em 0;
          font-size: 2em;
          font-weight: 700;
        }

        .welcome-content p {
          margin: 0;
          font-size: 1.08em;
          opacity: 0.9;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1em;
        }

        .user-avatar {
          width: 3.5em;
          height: 3.5em;
          background: #e0f7e9;
          color: #43a047;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.4em;
          border: 3px solid #c8e6c9;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 0.2em;
        }

        .user-name {
          font-weight: 600;
          font-size: 1.1em;
        }

        .user-role {
          opacity: 0.8;
          font-size: 0.9em;
          text-transform: capitalize;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5em;
          margin-bottom: 3em;
        }

        .stat-card {
          background: #fff;
          padding: 1.5em;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          gap: 1.2em;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(126,217,87,0.10);
        }

        .stat-icon {
          width: 3.5em;
          height: 3.5em;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8em;
          color: #fff;
        }

        .stat-icon.users {
          background: linear-gradient(135deg, #7ed957, #6bb946);
        }

        .stat-icon.charts {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 0.3em;
        }

        .stat-number {
          font-size: 2.1em;
          font-weight: 700;
          color: #111827;
        }

        .stat-label {
          color: #6b7280;
          font-size: 1em;
        }

        .stat-loading {
          display: inline-block;
          color: #9ca3af;
          font-size: 0.8em;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .stats-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2em;
          padding: 1em;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .last-updated {
          font-size: 0.85em;
          color: #6b7280;
          font-style: italic;
        }

        .refresh-button {
          background: #7ed957;
          color: white;
          border: none;
          padding: 0.5em 1em;
          border-radius: 6px;
          font-size: 0.85em;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.3em;
        }

        .refresh-button:hover {
          background: #6bb946;
          transform: translateY(-1px);
        }

        .refresh-button:active {
          transform: translateY(0);
        }

        .quick-actions h2 {
          margin: 0 0 1.5em 0;
          color: #111827;
          font-size: 1.6em;
          font-weight: 600;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5em;
        }

        .action-card {
          background: white;
          padding: 2em;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 1.5em;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-color: #7ed957;
        }

        .action-icon {
          font-size: 2.5em;
          color: #7ed957;
        }

        .action-content h3 {
          margin: 0 0 0.3em 0;
          color: #111827;
          font-size: 1.2em;
          font-weight: 600;
        }

        .action-content p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9em;
        }

        /* Ajustes responsivos */
        @media (max-width: 900px) {
          .welcome-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5em;
          }
        }
      `}</style>
    </MainContent>
  );
}
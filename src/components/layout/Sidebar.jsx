// Sidebar.jsx
"use client"
import React from 'react';
import Link from 'next/link';
import { PiSquaresFourBold, PiUsersThreeBold, PiLayoutBold, PiShieldStarBold } from 'react-icons/pi';

const modules = [
  { name: 'Dashboard', path: '/dashboard', icon: <PiSquaresFourBold size={22} /> },
  { name: 'Usuarios', path: '/usuarios', icon: <PiUsersThreeBold size={22} /> },
  { name: 'Módulos', path: '/modulos', icon: <PiLayoutBold size={22} /> },
  { name: 'Roles', path: '/roles', icon: <PiShieldStarBold size={22} /> },
  { name: 'Permisos', path: '/permissions', icon: <PiLayoutBold size={22} /> },
   { name: 'Test', path: '/test', icon: <PiLayoutBold size={22} /> },
  // Agrega más módulos según permisos
];

export default function Sidebar({ userModules = modules }) {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {userModules.map((mod) => (
            <li key={mod.path}>
              <Link href={mod.path}>
                <span className="icon">{mod.icon}</span> {mod.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <style jsx>{`
        .sidebar {
          width: 240px;
          background: linear-gradient(160deg, #232526 0%, #414345 100%);
          color: #f3f3f3;
          height: 100vh;
          padding: 2.5em 1.2em 2em 1.2em;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          box-shadow: 4px 0 24px 0 rgba(0,0,0,0.13);
          display: flex;
          flex-direction: column;
          z-index: 30;
        }
        nav {
          flex: 1;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        li {
          margin-bottom: 1.7em;
          border-radius: 8px;
          transition: background 0.18s;
        }
        li:hover, li.active {
          background: rgba(255,255,255,0.08);
        }
        .icon {
          margin-right: 0.9em;
          display: inline-flex;
          vertical-align: middle;
          color: #7ed957;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.10));
        }
        a {
          color: #f3f3f3;
          font-weight: 500;
          font-size: 1.13em;
          display: flex;
          align-items: center;
          padding: 0.7em 1em;
          border-radius: 8px;
          text-decoration: none;
          letter-spacing: 0.2px;
          transition: background 0.18s, color 0.18s;
        }
        a:hover, li.active a {
          background: #7ed95722;
          color: #7ed957;
        }
        @media (max-width: 900px) {
          .sidebar {
            width: 70px;
            padding: 2em 0.3em;
          }
          .icon {
            margin-right: 0;
          }
          a {
            justify-content: center;
            font-size: 1.3em;
            padding: 0.7em 0.2em;
          }
          a span:not(.icon) {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}

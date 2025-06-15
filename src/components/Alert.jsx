// Alert.jsx
import React from 'react';
import { PiInfoBold, PiCheckCircleBold, PiWarningBold, PiXCircleBold } from 'react-icons/pi';

/**
 * type: 'info' | 'success' | 'error' | 'warning'
 */
export default function Alert({ type = 'info', message, onClose }) {
  const icons = {
    info: <PiInfoBold size={22} />, // azul
    success: <PiCheckCircleBold size={22} />, // verde
    error: <PiXCircleBold size={22} />, // rojo
    warning: <PiWarningBold size={22} />, // naranja
  };
  const colors = {
    info: {
      background: 'var(--primary)',
      color: '#fff',
    },
    success: {
      background: 'var(--success)',
      color: '#fff',
    },
    error: {
      background: 'var(--danger)',
      color: '#fff',
    },
    warning: {
      background: 'var(--accent)',
      color: '#fff',
    },
  };
  const style = colors[type] || colors.info;
  const icon = icons[type] || icons.info;

  return (
    <div className="alert" style={{ background: style.background, color: style.color }}>
      <span className="icon">{icon}</span>
      <span className="msg">{message}</span>
      {onClose && (
        <button className="close" onClick={onClose} aria-label="Cerrar">×</button>
      )}
      <style jsx>{`
        .alert {
          display: flex;
          align-items: center;
          gap: 1em;
          padding: 1em 1.5em;
          border-radius: var(--radius);
          margin: 1em 0;
          font-size: 1.05em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          position: relative;
        }
        .icon {
          font-size: 1.3em;
          display: flex;
          align-items: center;
        }
        .close {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.3em;
          cursor: pointer;
          position: absolute;
          right: 1em;
          top: 0.7em;
        }
      `}</style>
    </div>
  );
}

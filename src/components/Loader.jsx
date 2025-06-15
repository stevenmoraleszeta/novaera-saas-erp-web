// Loader.jsx
import React from 'react';

export default function Loader({ text = 'Cargando...' }) {
  return (
    <div className="loader-container">
      <div className="loader" />
      <span>{text}</span>
      <style jsx>{`
        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 120px;
          gap: 1em;
        }
        .loader {
          border: 4px solid var(--secondary);
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        span {
          color: var(--foreground);
          font-size: 1.1em;
        }
      `}</style>
    </div>
  );
}

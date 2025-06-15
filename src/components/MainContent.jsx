// MainContent.jsx
import React from 'react';

export default function MainContent({ children }) {
  return (
    <main className="main-content">
      {children}
      <style jsx>{`
        .main-content {
          margin-left: 220px;
          margin-top: 60px;
          margin-bottom: 60px;
          padding: 2em;
          min-height: calc(100vh - 120px);
          background: var(--background);
          color: var(--foreground);
        }
      `}</style>
    </main>
  );
}

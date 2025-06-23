// Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div>
        &copy; {new Date().getFullYear()} ERP System &mdash; v1.0.0
      </div>
      <div>
        <a href="/legal">Legales</a> | <a href="/soporte">Soporte</a>
      </div>
      <style jsx>{`
        .footer {
          width: 100%;
          background: var(--secondary);
          color: var(--foreground);
          text-align: center;
          padding: 1em 0;
          position: fixed;
          left: 0;
          bottom: 0;
          z-index: 10;
          font-size: 0.95em;
          border-top: 1px solid var(--border);
        }
        a { color: var(--primary); margin: 0 0.5em; }
        a:hover { text-decoration: underline; }
      `}</style>
    </footer>
  );
}

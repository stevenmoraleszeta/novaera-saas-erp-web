import React from 'react';

/**
 * type: 'primary' | 'secondary' | 'danger' | 'success' | 'accent'
 */
export default function Button({ type = 'primary', children, className = '', ...props }) {
  return (
    <button
      className={`btn btn-${type} ${className}`.trim()}
      {...props}
    >
      {children}
      <style jsx>{`
        .btn {
          background: var(--primary);
          color: #fff;
          border: none;
          border-radius: var(--radius);
          padding: 0.5em 1.2em;
          font-weight: 600;
          cursor: pointer;
          transition: background var(--transition), color var(--transition), box-shadow var(--transition);
        }
        .btn-secondary {
          background: var(--secondary);
          color: var(--foreground);
          border: 1px solid var(--border);
        }
        .btn-danger {
          background: var(--danger);
        }
        .btn-success {
          background: var(--success);
        }
        .btn-accent {
          background: var(--accent);
        }
        .btn:hover {
          filter: brightness(0.95);
        }
      `}</style>
    </button>
  );
}

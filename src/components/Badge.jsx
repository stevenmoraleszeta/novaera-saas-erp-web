// components/ui/badge.jsx
import React from 'react';

export function Badge({ children, variant = 'default' }) {
  return (
    <span className={`badge ${variant}`}>
      {children}
      <style jsx>{`
        .badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1;
          white-space: nowrap;
        }
        .default {
          background-color: #E5E7EB;
          color: #111827;
        }
        .outline {
          background-color: white;
          border: 1px solid #D1D5DB;
          color: #111827;
        }
      `}</style>
    </span>
  );
}

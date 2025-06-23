"use client";

import React from 'react';

/**
 * Button component with support for different variants, loading state, and icons
 * 
 * Props:
 * - variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'accent'
 * - type: 'button' | 'submit' | 'reset'
 * - loading: boolean
 * - disabled: boolean
 * - leftIcon: ReactNode
 * - rightIcon: ReactNode
 * - className: string
 * - children: ReactNode
 */
export default function Button({
  variant,
  type = 'button',
  loading,
  disabled,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...props
}) {
  // Remove loading from props that go to the DOM element
  const { loading: _, ...domProps } = props;

  // Handle backward compatibility: if type is a variant name and no variant is specified
  const htmlButtonTypes = ['button', 'submit', 'reset'];
  const isHtmlType = htmlButtonTypes.includes(type);

  const buttonType = isHtmlType ? type : 'button';
  const buttonVariant = variant || (!isHtmlType ? type : 'primary');

  const isDisabled = disabled || loading;

  return (
    <button
      type={buttonType}
      className={`btn btn-${buttonVariant} ${className}`.trim()}
      disabled={isDisabled}
      {...domProps}
    >
      {loading && <span className="loading-spinner"></span>}
      {!loading && leftIcon && <span className="left-icon">{leftIcon}</span>}
      <span className="button-content">{children}</span>
      {!loading && rightIcon && <span className="right-icon">{rightIcon}</span>}

      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: var(--primary, #7ed957);
          color: #fff;
          border: 2px solid transparent;
          border-radius: var(--radius, 8px);
          padding: 0.65em 1.2em;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 42px;
          position: relative;
        }
        
        .btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .btn-primary {
          background: var(--primary, #7ed957);
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #6bb946;
          box-shadow: 0 2px 8px rgba(126, 217, 87, 0.3);
        }
        
        .btn-secondary {
          background: var(--secondary, #f3f4f6);
          color: var(--foreground, #374151);
          border-color: var(--border, #e5e7eb);
        }
        
        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }
        
        .btn-outline {
          background: transparent;
          color: var(--primary, #7ed957);
          border-color: var(--primary, #7ed957);
        }
        
        .btn-outline:hover:not(:disabled) {
          background: var(--primary, #7ed957);
          color: white;
        }
        
        .btn-danger {
          background: var(--danger, #ef4444);
          color: white;
        }
        
        .btn-danger:hover:not(:disabled) {
          background: #dc2626;
        }
        
        .btn-success {
          background: var(--success, #10b981);
          color: white;
        }
        
        .btn-success:hover:not(:disabled) {
          background: #059669;
        }
        
        .btn-accent {
          background: var(--accent, #f59e0b);
          color: white;
        }
        
        .btn-accent:hover:not(:disabled) {
          background: #d97706;
        }
        
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .left-icon,
        .right-icon {
          display: flex;
          align-items: center;
          font-size: 1rem;
        }
        
        .button-content {
          flex: 1;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}

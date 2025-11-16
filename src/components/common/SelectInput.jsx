// SelectInput.jsx - Dropdown component with dynamic options
import React from 'react';
import ReusableCombobox from '@/components/ui/reusableCombobox';

/**
 * Props:
 *  - label: string
 *  - name: string
 *  - value: string/number
 *  - onChange: function
 *  - options: array of {value, label} objects
 *  - error: string (mensaje de error)
 *  - helper: string (mensaje de ayuda)
 *  - placeholder: string
 *  - loading: boolean
 *  - ...rest: otros props para el select
 */
export default function SelectInput({
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    helper,
    placeholder = "Seleccionar...",
    loading = false,
    ...rest
}) {
  const effectivePlaceholder = loading ? 'Cargando...' : placeholder;
  return (
    <div className="space-y-1.5">
      <ReusableCombobox
        label={label}
        placeholder={effectivePlaceholder}
        options={options}
        value={value}
        onChange={onChange}
        disabled={loading} // Deshabilitamos el combobox mientras carga
        {...rest}
      />
 
      {helper && !error && (
        <p id={`${name}-helper`} className="text-xs text-muted-foreground">
          {helper}
         </p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );

  // return (
  //       <div className={`form-select${error ? ' has-error' : ''}`}>
  //           {label && <label htmlFor={name}>{label}</label>}
  //           <div className="select-wrapper">
  //               <select
  //                   id={name}
  //                   name={name}
  //                   value={value}
  //                   onChange={onChange}
  //                   aria-invalid={!!error}
  //                   aria-describedby={error ? `${name}-error` : helper ? `${name}-helper` : undefined}
  //                   disabled={loading}
  //                   {...rest}
  //               >
  //                   <option value="" disabled>
  //                       {loading ? 'Cargando...' : placeholder}
  //                   </option>
  //                   {options.map((option) => (
  //                       <option key={option.value} value={option.value}>
  //                           {option.label}
  //                       </option>
  //                   ))}
  //               </select>
  //               <span className="select-arrow">
  //                   <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
  //                       <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  //                   </svg>
  //               </span>
  //           </div>
  //           {helper && !error && <span className="helper-msg" id={`${name}-helper`}>{helper}</span>}
  //           {error && <span className="error-msg" id={`${name}-error`}>{error}</span>}

  //           <style jsx>{`
  //       .form-select {
  //         display: flex;
  //         flex-direction: column;
  //         gap: 0.5rem;
  //         position: relative;
  //       }

  //       .form-select label {
  //         font-weight: 500;
  //         color: var(--text-primary, #111827);
  //         font-size: 0.875rem;
  //         line-height: 1.25rem;
  //       }

  //       .select-wrapper {
  //         position: relative;
  //       }

  //       .select-wrapper select {
  //         width: 100%;
  //         padding: 0.75rem 2.5rem 0.75rem 1rem;
  //         border: 1px solid var(--border-color, #e5e7eb);
  //         border-radius: 0.5rem;
  //         font-size: 0.875rem;
  //         line-height: 1.25rem;
  //         background: white;
  //         color: var(--text-primary, #111827);
  //         appearance: none;
  //         transition: all 0.2s ease;
  //       }

  //       .select-wrapper select:focus {
  //         outline: none;
  //         border-color: var(--primary-green, #7ed957);
  //         box-shadow: 0 0 0 3px rgba(126, 217, 87, 0.1);
  //       }

  //       .select-wrapper select:disabled {
  //         background-color: var(--background, #f9fafb);
  //         color: var(--text-secondary, #6b7280);
  //         cursor: not-allowed;
  //       }

  //       .select-arrow {
  //         position: absolute;
  //         right: 1rem;
  //         top: 50%;
  //         transform: translateY(-50%);
  //         pointer-events: none;
  //         color: var(--text-secondary, #6b7280);
  //         transition: transform 0.2s ease;
  //       }

  //       .select-wrapper select:focus + .select-arrow {
  //         transform: translateY(-50%) rotate(180deg);
  //       }

  //       .helper-msg {
  //         font-size: 0.75rem;
  //         color: var(--text-secondary, #6b7280);
  //         line-height: 1rem;
  //       }

  //       .error-msg {
  //         font-size: 0.75rem;
  //         color: var(--error-text, #dc2626);
  //         line-height: 1rem;
  //         font-weight: 500;
  //       }

  //       .has-error .select-wrapper select {
  //         border-color: var(--error-text, #dc2626);
  //         background-color: var(--error-bg, #fee2e2);
  //       }

  //       .has-error .select-wrapper select:focus {
  //         border-color: var(--error-text, #dc2626);
  //         box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  //       }

  //       /* Hover effects */
  //       .select-wrapper:hover select:not(:disabled) {
  //         border-color: var(--primary-hover, #6bb946);
  //       }

  //       /* Dark mode support */
  //       @media (prefers-color-scheme: dark) {
  //         .form-select label {
  //           color: #f9fafb;
  //         }
          
  //         .select-wrapper select {
  //           background: #1f2937;
  //           border-color: #374151;
  //           color: #f9fafb;
  //         }
          
  //         .select-wrapper select:disabled {
  //           background-color: #111827;
  //           color: #6b7280;
  //         }
  //       }
  //     `}</style>
  //       </div>
  //   );
} 
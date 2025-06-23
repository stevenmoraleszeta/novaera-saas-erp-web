// FormInput.jsx
import React from 'react';

/**
 * props:
 *  - label: string
 *  - name: string
 *  - type: string (text, password, email, etc.)
 *  - value: string
 *  - onChange: function
 *  - error: string (mensaje de error)
 *  - helper: string (mensaje de ayuda)
 *  - ...rest: otros props para el input
 */
export default function FormInput({ label, value, onChange, name, error, required = false, style = {}, as, ...props }) {
  const InputTag = as === 'textarea' ? 'textarea' : 'input';
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <InputTag
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{ ...style, border: error ? '1px solid red' : style.border || '#d1d5db', resize: as === 'textarea' ? 'vertical' : undefined }}
        {...props}
      />
      {error && <div style={{ color: 'red', fontSize: 13, marginTop: 2 }}>{error}</div>}
    </div>
  );
}

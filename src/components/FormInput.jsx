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
export default function FormInput({ label, name, type = 'text', value, onChange, error, helper, ...rest }) {
  return (
    <div className={`form-input${error ? ' has-error' : ''}`}>
      {label && <label htmlFor={name}>{label}</label>}
      <div className="input-wrapper">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helper ? `${name}-helper` : undefined}
          autoComplete="off"
          {...rest}
        />
        <span className="focus-border"></span>
      </div>
      {helper && !error && <span className="helper-msg" id={`${name}-helper`}>{helper}</span>}
      {error && <span className="error-msg" id={`${name}-error`}>{error}</span>}
      <style jsx>{`
        .form-input {
          display: flex;
          flex-direction: column;
          gap: 0.3em;
          margin-bottom: 1.7em;
        }
        label {
          font-weight: 700;
          color: #232526;
          letter-spacing: 0.3px;
          margin-bottom: 0.18em;
          font-size: 1.09em;
          text-shadow: 0 1px 0 #fff, 0 1.5px 2px #eaeaea;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 12px 0 rgba(126,217,87,0.06);
          border: 1.5px solid #e0e0e0;
          transition: border-color 0.22s, box-shadow 0.22s;
        }
        input {
          width: 100%;
          border: none;
          border-radius: 10px;
          padding: 1em 1.2em;
          font-size: 1.13em;
          background: transparent;
          color: #232526;
          transition: box-shadow 0.22s, background 0.22s;
          font-family: inherit;
        }
        input:focus {
          outline: none;
          background: #f3fff7;
        }
        .input-wrapper:focus-within {
          border-color: #7ed957;
          box-shadow: 0 2px 16px 0 rgba(126,217,87,0.13);
        }
        .focus-border {
          display: none;
        }
        .has-error .input-wrapper {
          border-color: #e53935;
          background: #fff6f6;
        }
        .has-error input {
          background: #fff6f6;
        }
        .error-msg {
          color: #e53935;
          font-size: 1em;
          margin-top: 0.13em;
          font-weight: 500;
          letter-spacing: 0.1px;
        }
        .helper-msg {
          color: #7ed957;
          font-size: 1em;
          margin-top: 0.13em;
          font-weight: 500;
          letter-spacing: 0.1px;
        }
        input:disabled {
          background: #f3f3f3;
          color: #bdbdbd;
          border-bottom: 2.5px dashed #bdbdbd;
        }
      `}</style>
    </div>
  );
}

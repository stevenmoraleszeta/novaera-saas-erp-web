// FormInput.jsx
import React from "react";

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
export default function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helper,
  autoFocus = false,
  ...props
}) {
  const hasError = !!error;
  const hasHelper = !!helper && !error;

  return (
    <div className={`flex flex-col gap-2 mb-6 ${hasError ? "has-error" : ""}`}>
      <label
        htmlFor={name}
        className="font-bold text-gray-800 tracking-wide mb-1 text-lg drop-shadow-sm"
      >
        {label}
      </label>

      <div className="relative flex items-center bg-white rounded-lg shadow-sm border-2 border-gray-200 transition-all duration-200 focus-within:border-green-500 focus-within:shadow-lg">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          className="w-full border-none rounded-lg px-5 py-4 text-lg bg-transparent text-gray-800 transition-all duration-200 focus:outline-none focus:bg-green-50"
          {...props}
        />
      </div>

      {hasHelper && (
        <span className="text-green-600 text-base font-medium tracking-wide">
          {helper}
        </span>
      )}

      {hasError && (
        <span className="text-red-600 text-base font-medium tracking-wide">
          {error}
        </span>
      )}
    </div>
  );
}

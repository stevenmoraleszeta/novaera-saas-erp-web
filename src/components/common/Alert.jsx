// Alert.jsx
import React from "react";
import {
  PiInfoBold,
  PiCheckCircleBold,
  PiWarningBold,
  PiXCircleBold,
} from "react-icons/pi";

/**
 * type: 'info' | 'success' | 'error' | 'warning'
 */
export default function Alert({ type = "info", message, onClose }) {
  const icons = {
    info: <PiInfoBold size={22} />, // azul
    success: <PiCheckCircleBold size={22} />, // verde
    error: <PiXCircleBold size={22} />, // rojo
    warning: <PiWarningBold size={22} />, // naranja
  };

  const alertStyles = {
    info: "bg-blue-500 text-white",
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-white",
  };

  const icon = icons[type] || icons.info;
  const styleClass = alertStyles[type] || alertStyles.info;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg shadow-md my-4 relative ${styleClass}`}
    >
      <span className="text-xl flex items-center">{icon}</span>
      <span className="text-lg">{message}</span>
      {onClose && (
        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-2xl cursor-pointer hover:opacity-80"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
      )}
    </div>
  );
}

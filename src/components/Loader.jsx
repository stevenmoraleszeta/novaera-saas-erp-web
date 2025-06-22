// Loader.jsx
import React from "react";

export default function Loader({ text = "Cargando..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[120px] gap-4">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
      <span className="text-gray-700 text-lg">{text}</span>
    </div>
  );
}

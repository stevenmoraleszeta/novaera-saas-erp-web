// Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-white text-black text-center py-4 text-sm border-t border-gray-200">
      <div>&copy; {new Date().getFullYear()} ERP System &mdash; v1.0.0</div>
      <div>
        <a href="/legal" className="mx-2 hover:underline">
          Legales
        </a>{" "}
        |
        <a href="/soporte" className="mx-2 hover:underline">
          Soporte
        </a>
      </div>
    </footer>
  );
}

// MainContent.jsx
import React from "react";

export default function MainContent({ children }) {
  return (
    <main className="ml-[100px] mt-[60px] mb-[60px] p-8 min-h-[calc(100vh-120px)] text-gray-900">
      {children}
    </main>
  );
}

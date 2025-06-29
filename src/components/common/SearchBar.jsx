"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({
  onSearch,
  placeholder = "Buscar...",
  debounceDelay = 300,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => onSearch(searchTerm), debounceDelay);
    setDebounceTimer(timer);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
    inputRef.current?.focus();
  };

  // El ancho total que ocupará la lupa + barra expandida
  const totalWidth = 250;
  // Cuando está colapsado, la lupa tiene 40px de ancho con padding
  const collapsedWidth = 40;
  // La cantidad que se desplaza hacia la izquierda la lupa para dejar espacio a la barra
  const translateX = expanded ? totalWidth - collapsedWidth : 0;

  return (
    <div
      className="relative flex items-center"
      style={{ width: 60 }}
    >
      <div
        className="flex items-center bg-gray-100 rounded transition-transform duration-300"
        style={{ transform: `translateX(-${translateX}px)` }}
      >
        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-2"
          aria-label="Toggle search bar"
        >
          <Search className="w-5 h-5 text-black" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className={`transition-opacity duration-300 bg-gray-100 outline-none border border-gray-300 rounded-r px-3 py-1 text-sm ${
            expanded ? "opacity-100 w-[210px]" : "opacity-0 w-0"
          }`}
          style={{ transitionProperty: "opacity, width" }}
        />

        {expanded && searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

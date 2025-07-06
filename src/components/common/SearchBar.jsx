"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({
  onSearch,
  placeholder = "Buscar...",
  debounceDelay = 300,
  value = "",
  loading = false,
}) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => onSearch(searchTerm), debounceDelay);
    setDebounceTimer(timer);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch, debounceDelay]);

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className={`relative flex items-center transition-all duration-200 ${
        isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}>
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <Search className={`w-4 h-4 transition-colors duration-200 ${
            isFocused ? 'text-blue-500' : 'text-gray-400'
          }`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={loading}
          className={`
            w-full pl-10 pr-10 py-2.5 
            bg-white border border-gray-300 rounded-lg
            text-sm text-gray-900 placeholder-gray-500
            transition-all duration-200
            focus:outline-none focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            ${isFocused ? 'shadow-sm' : ''}
          `}
        />

        {searchTerm && !loading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 
                     text-gray-400 hover:text-gray-600 transition-colors duration-200
                     p-1 rounded-full hover:bg-gray-100"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 px-1">
          Buscando: "{searchTerm}"
        </div>
      )}
    </div>
  );
}

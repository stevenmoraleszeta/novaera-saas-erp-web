"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({
  onSearch,
  placeholder = "Buscar...",
  debounceDelay = 300,
  className = "",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceDelay);

    setDebounceTimer(timer);

    // Cleanup on unmount
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchTerm, onSearch, debounceDelay]);

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 bg-white text-black placeholder-gray-400 outline-none focus:border-black focus:ring-1 focus:ring-black"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

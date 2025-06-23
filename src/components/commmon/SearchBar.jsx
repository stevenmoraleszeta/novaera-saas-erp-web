"use client";

import React, { useState, useEffect } from 'react';
import { PiMagnifyingGlassBold, PiXBold } from 'react-icons/pi';

export default function SearchBar({
    onSearch,
    placeholder = "Buscar por nombre, email o rol...",
    debounceDelay = 300,
    className = ""
}) {
    const [searchTerm, setSearchTerm] = useState('');
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
        setSearchTerm('');
        onSearch('');
    };

    return (
        <div className={`search-bar ${className}`}>
            <div className="search-input-container">
                <PiMagnifyingGlassBold className="search-icon" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={placeholder}
                    className="search-input"
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="clear-button"
                        aria-label="Limpiar búsqueda"
                    >
                        <PiXBold />
                    </button>
                )}
            </div>

            <style jsx>{`
        .search-bar {
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 400px;
        }
        
        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .search-input-container:focus-within {
          border-color: #7ed957;
          box-shadow: 0 0 0 3px rgba(126, 217, 87, 0.1);
        }
        
        .search-icon {
          position: absolute;
          left: 0.9em;
          color: #9ca3af;
          font-size: 1.1em;
          pointer-events: none;
          z-index: 1;
        }
        
        .search-input {
          width: 100%;
          padding: 0.8em 1em 0.8em 2.8em;
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.95em;
          color: #374151;
          letter-spacing: 0.2px;
        }
        
        .search-input::placeholder {
          color: #9ca3af;
          font-style: italic;
        }
        
        .clear-button {
          position: absolute;
          right: 0.7em;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.3em;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9em;
          transition: all 0.2s ease;
          z-index: 1;
        }
        
        .clear-button:hover {
          background: #f3f4f6;
          color: #6b7280;
          transform: scale(1.05);
        }
        
        .clear-button:active {
          transform: scale(0.95);
        }
        
        @media (max-width: 768px) {
          .search-bar {
            max-width: 100%;
          }
          
          .search-input {
            padding: 0.7em 1em 0.7em 2.6em;
            font-size: 0.9em;
          }
          
          .search-icon {
            left: 0.8em;
            font-size: 1em;
          }
        }
      `}</style>
        </div>
    );
}
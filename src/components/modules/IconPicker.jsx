"use client";

import React, { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from "@/components/ui/input";
import emojiList from '@/lib/emoji-list.json';

const CDN_URL_BASE = "https://cdn.jsdelivr.net/npm/fluentui-emoji@1.3.0/icons/modern/";

// CATEGORIAS  
const categories = {
  all: "🌐",
  smileys: "😀",
  people: "🧑",
  animals: "🐻",
  food: "🍔",
  travel: "✈️",
  activities: "⚽",
  objects: "💡",
  symbols: "❤️",
};

export function IconPicker({ onSelect }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredEmojis = useMemo(() => {
    let emojis = emojiList;

    if (activeCategory !== "all") {
      // emojis = emojis.filter(emoji => emoji.category === activeCategory);
      let emojis = search ? emojiList : emojiList.filter(emoji => activeCategory === 'all' || emoji.category === activeCategory);
    }

    if (search) {
      const lowercasedSearch = search.toLowerCase();
      emojis = emojis.filter(emoji => 
        emoji.name.toLowerCase().includes(lowercasedSearch) ||
        (emoji.name_es && emoji.name_es.toLowerCase().includes(lowercasedSearch))
      );
    }
    return emojis;
  }, [search, activeCategory]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    // Cada vez que escribes, se resetea la categoría a "todos"
    setActiveCategory("all");
  };

  return (
    <div className="p-2 flex flex-col gap-3 w-[330px] max-h-[75vh]">
      {/* Barra de Búsqueda */}
      <Input 
        type="text"
        placeholder="Buscar ícono..."
        value={search}
        onChange={handleSearchChange}
      />

      {/* Pestañas de Categorías */}
      <div className="flex items-center justify-around border-b pb-2">
        {Object.entries(categories).map(([key, value]) => (
          <button
            key={key}
            onClick={() => {
              setActiveCategory(key)
              setSearch("");
            }}
            className={`text-xl p-1 rounded-md ${activeCategory === key ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            title={key.charAt(0).toUpperCase() + key.slice(1)} // Pone el nombre de la categoría como tooltip
          >
            {value}
          </button>
        ))}
      </div>

      {/* Lista de Íconos */}
      <ScrollArea className="h-[200px]">
        <div className="grid grid-cols-6 gap-2">
          {filteredEmojis.map(emoji => {
            const fullUrl = `${CDN_URL_BASE}${emoji.fileName}`;
            return (
              <button
                key={emoji.name}
                type="button"
                onClick={() => onSelect(fullUrl)}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 aspect-square"
                title={emoji.name}
              >
                <img src={fullUrl} alt={emoji.name} className="w-8 h-8 object-contain" loading="lazy" />
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
import React from "react";
import SearchBar from "./SearchBar";

export default function ModuleFilter({
  searchQuery = "",
  filters = { status: "", category: "" },
  onSearch,
  onFilterChange,
}) {
  return (
    <div className="flex gap-4 mb-6 flex-wrap items-center">
      <SearchBar
        onSearch={onSearch}
        placeholder="Buscar por nombre, email o rol..."
      />
    </div>
  );
}

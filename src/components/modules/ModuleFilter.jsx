import React from 'react';
import SearchBar from '../commmon/SearchBar';


export default function ModuleFilter({
  searchQuery = '',
  filters = { status: '', category: '' },
  onSearch,
  onFilterChange
}) {
  return (
    <div className="module-filter">


{/* 

      <input
        type="search"
        placeholder="Buscar por nombre o descripción..."
        value={searchQuery}
        onChange={e => onSearch(e.target.value)}
        className="search-input"
        aria-label="Buscar módulos"
      />
 */}

        <SearchBar
            onSearch={onSearch}
            placeholder="Buscar por nombre o descripción...."
        />
        
        {/* 

              <select
        value={filters.status}
        onChange={e => onFilterChange({ status: e.target.value })}
        className="filter-select"
        aria-label="Filtrar por estado"
      >
        <option value="">Todos los estados</option>
        <option value="active">Activo</option>
        <option value="inactive">Inactivo</option>
      </select>

      <select
        value={filters.category}
        onChange={e => onFilterChange({ category: e.target.value })}
        className="filter-select"
        aria-label="Filtrar por categoría"
      >
        <option value="">Todas las categorías</option>
        <option value="inventory">Inventario</option>
        <option value="hr">Recursos Humanos</option>
        <option value="finance">Finanzas</option>
        {/* Agrega aquí más categorías según tu sistema 
      </select>
        
         */}


      <style jsx>{`
        .module-filter {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5em;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-input {
          flex: 1 1 250px;
          padding: 0.5em 1em;
          border: 1.5px solid #ccc;
          border-radius: 8px;
          font-size: 1em;
          transition: border-color 0.2s;
        }
        .search-input:focus {
          outline: none;
          border-color: #7ed957;
          box-shadow: 0 0 5px #7ed957aa;
        }

        .filter-select {
          flex: 0 0 180px;
          padding: 0.5em 1em;
          border: 1.5px solid #ccc;
          border-radius: 8px;
          font-size: 1em;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .filter-select:focus {
          outline: none;
          border-color: #7ed957;
          box-shadow: 0 0 5px #7ed957aa;
        }
      `}</style>
    </div>
  );
}

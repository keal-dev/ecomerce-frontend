'use client';

import React from 'react';
import { TbArrowsSort, TbFilter } from 'react-icons/tb';

export type SearchSortOption = 'relevance' | 'price_asc' | 'price_desc' | 'discount_desc';

interface SearchHeaderProps {
  query: string;
  totalResults: number;
  sortBy: SearchSortOption;
  onSortChange: (sort: SearchSortOption) => void;
  onOpenMobileFilters: () => void;
  activeFilterCount: number;
}

export const SearchHeader = ({
  query,
  totalResults,
  sortBy,
  onSortChange,
  onOpenMobileFilters,
  activeFilterCount,
}: SearchHeaderProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            {query ? `Resultados para "${query}"` : 'Catálogo completo'}
          </h1>
          <span className="text-xs text-gray-500 font-light">
            ({totalResults} {totalResults === 1 ? 'publicación' : 'publicaciones'})
          </span>
        </div>
        <p className="text-xs text-gray-400 font-light mt-0.5">
          Precios actualizados y envíos garantizados
        </p>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {/* Botón para abrir filtros en móvil */}
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg cursor-pointer"
        >
          <TbFilter size={15} />
          <span>Filtros</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#3483fa] text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Selector de ordenamiento */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs">
          <TbArrowsSort size={14} className="text-gray-500" />
          <span className="text-gray-500 hidden sm:inline">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SearchSortOption)}
            className="bg-transparent text-gray-800 font-medium outline-none cursor-pointer text-xs"
          >
            <option value="relevance">Más relevantes</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="discount_desc">Mayor descuento</option>
          </select>
        </div>
      </div>
    </div>
  );
};

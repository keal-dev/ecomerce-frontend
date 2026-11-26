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
    <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <h1 className="font-display text-lg sm:text-xl font-extrabold uppercase tracking-tight text-black">
            {query ? `Resultados para "${query}"` : 'Catálogo completo'}
          </h1>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            ({totalResults} {totalResults === 1 ? 'producto' : 'productos'})
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          Productos de origen con delivery garantizado
        </p>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {/* Botón para abrir filtros en móvil */}
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-black text-white hover:bg-[#de2a2a] text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors"
        >
          <TbFilter size={15} />
          <span>Filtros</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-none bg-[#de2a2a] text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Selector de ordenamiento */}
        <div className="flex items-center gap-1.5 bg-white border border-[#d9d9d9] px-3 py-2 rounded-none text-xs">
          <TbArrowsSort size={14} className="text-black" />
          <span className="text-neutral-500 hidden sm:inline font-medium">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SearchSortOption)}
            className="bg-transparent text-black font-bold outline-none cursor-pointer text-xs"
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

'use client';

import React from 'react';
import { TbFilter, TbX, TbTruckDelivery, TbBolt, TbPercentage } from 'react-icons/tb';

export interface SearchFilterState {
  categoryId: string | null;
  onlyFreeShipping: boolean;
  onlyFull: boolean;
  onlyDeals: boolean;
  minPrice: string;
  maxPrice: string;
}

interface SearchCategoryCount {
  id: string;
  name: string;
  count: number;
}

interface SearchFiltersProps {
  filters: SearchFilterState;
  categories: SearchCategoryCount[];
  currencySymbol: string;
  onFilterChange: (partial: Partial<SearchFilterState>) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const SearchFilters = ({
  filters,
  categories,
  currencySymbol,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
}: SearchFiltersProps) => {
  return (
    <aside className="bg-white rounded-none border border-[#d9d9d9] p-4 sm:p-5 space-y-6">
      {/* Título de Filtros y botón limpiar */}
      <div className="flex items-center justify-between border-b border-[#d9d9d9] pb-3">
        <div className="flex items-center gap-2">
          <TbFilter size={17} className="text-[#de2a2a]" />
          <h2 className="font-display text-sm font-extrabold uppercase tracking-tight text-black">
            Filtros
          </h2>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-[#de2a2a] hover:text-red-700 font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
          >
            <TbX size={14} />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* 1. Categorías coincidentes */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
            Categorías
          </h3>
          <ul className="space-y-1 text-xs">
            <li>
              <button
                type="button"
                onClick={() => onFilterChange({ categoryId: null })}
                className={`w-full text-left py-1.5 px-2.5 rounded-none transition-colors flex items-center justify-between cursor-pointer ${
                  filters.categoryId === null
                    ? 'font-bold bg-black text-white'
                    : 'text-neutral-700 hover:bg-[#f8f8f8] hover:text-black'
                }`}
              >
                <span>Todas</span>
              </button>
            </li>
            {categories.map((cat) => {
              const isSelected = filters.categoryId === cat.id;
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ categoryId: isSelected ? null : cat.id })}
                    className={`w-full text-left py-1.5 px-2.5 rounded-none transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'font-bold bg-black text-white'
                        : 'text-neutral-700 hover:bg-[#f8f8f8] hover:text-black'
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className={`text-[11px] shrink-0 ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                      ({cat.count})
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 2. Filtros de Envío y Oferta */}
      <div className="space-y-2.5 pt-4 border-t border-[#d9d9d9]">
        <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
          Beneficios
        </h3>

        <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer select-none hover:text-black">
          <input
            type="checkbox"
            checked={filters.onlyFreeShipping}
            onChange={(e) => onFilterChange({ onlyFreeShipping: e.target.checked })}
            className="w-4 h-4 rounded-none accent-[#de2a2a] cursor-pointer"
          />
          <TbTruckDelivery size={16} className="text-[#2e9e7b]" />
          <span>Envío gratis</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer select-none hover:text-black">
          <input
            type="checkbox"
            checked={filters.onlyFull}
            onChange={(e) => onFilterChange({ onlyFull: e.target.checked })}
            className="w-4 h-4 rounded-none accent-[#de2a2a] cursor-pointer"
          />
          <span className="text-[#2e9e7b] font-bold italic flex items-center text-xs">
            <TbBolt size={14} className="mr-0.5" /> EXPRESS
          </span>
          <span>Envío inmediato</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer select-none hover:text-black">
          <input
            type="checkbox"
            checked={filters.onlyDeals}
            onChange={(e) => onFilterChange({ onlyDeals: e.target.checked })}
            className="w-4 h-4 rounded-none accent-[#de2a2a] cursor-pointer"
          />
          <TbPercentage size={16} className="text-[#de2a2a]" />
          <span>Solo ofertas y descuentos</span>
        </label>
      </div>

      {/* 3. Rango de precio */}
      <div className="space-y-2.5 pt-4 border-t border-[#d9d9d9]">
        <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
          Precio ({currencySymbol})
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Mínimo"
            value={filters.minPrice}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            className="w-full text-xs px-2.5 py-2 border border-[#d9d9d9] rounded-none outline-none focus:border-black bg-white"
          />
          <span className="text-neutral-400 text-xs">-</span>
          <input
            type="number"
            min="0"
            placeholder="Máximo"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            className="w-full text-xs px-2.5 py-2 border border-[#d9d9d9] rounded-none outline-none focus:border-black bg-white"
          />
        </div>
      </div>
    </aside>
  );
};

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
    <aside className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-4 sm:p-5 space-y-6">
      {/* Título de Filtros y botón limpiar */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <TbFilter size={18} className="text-[#3483fa]" />
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">Filtros</h2>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <TbX size={14} />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* 1. Categorías coincidentes */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Categorías
          </h3>
          <ul className="space-y-1 text-xs">
            <li>
              <button
                type="button"
                onClick={() => onFilterChange({ categoryId: null })}
                className={`w-full text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between cursor-pointer ${
                  filters.categoryId === null
                    ? 'font-bold text-[#3483fa] bg-blue-50/60'
                    : 'text-gray-600 hover:bg-gray-50'
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
                    className={`w-full text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'font-bold text-[#3483fa] bg-blue-50/60'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className="text-[11px] text-gray-400 shrink-0">({cat.count})</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 2. Filtros de Envío y Oferta */}
      <div className="space-y-2.5 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
          Beneficios
        </h3>

        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none hover:text-gray-900">
          <input
            type="checkbox"
            checked={filters.onlyFreeShipping}
            onChange={(e) => onFilterChange({ onlyFreeShipping: e.target.checked })}
            className="w-4 h-4 rounded text-[#3483fa] focus:ring-0 cursor-pointer"
          />
          <TbTruckDelivery size={16} className="text-[#00a650]" />
          <span>Envío gratis</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none hover:text-gray-900">
          <input
            type="checkbox"
            checked={filters.onlyFull}
            onChange={(e) => onFilterChange({ onlyFull: e.target.checked })}
            className="w-4 h-4 rounded text-[#3483fa] focus:ring-0 cursor-pointer"
          />
          <span className="text-[#00a650] font-bold italic flex items-center text-xs">
            <TbBolt size={14} className="mr-0.5" /> FULL
          </span>
          <span>Envío inmediato</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none hover:text-gray-900">
          <input
            type="checkbox"
            checked={filters.onlyDeals}
            onChange={(e) => onFilterChange({ onlyDeals: e.target.checked })}
            className="w-4 h-4 rounded text-[#3483fa] focus:ring-0 cursor-pointer"
          />
          <TbPercentage size={16} className="text-[#00a650]" />
          <span>Solo ofertas y descuentos</span>
        </label>
      </div>

      {/* 3. Rango de precio */}
      <div className="space-y-2.5 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
          Precio ({currencySymbol})
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Mínimo"
            value={filters.minPrice}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-md outline-none focus:border-[#3483fa]"
          />
          <span className="text-gray-400 text-xs">-</span>
          <input
            type="number"
            min="0"
            placeholder="Máximo"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-md outline-none focus:border-[#3483fa]"
          />
        </div>
      </div>
    </aside>
  );
};

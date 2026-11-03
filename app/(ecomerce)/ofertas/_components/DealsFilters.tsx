'use client';

import React from 'react';
import { TbFilter, TbX, TbTruckDelivery, TbBolt, TbPercentage } from 'react-icons/tb';

export interface DealsFilterState {
  minDiscount: number; // 0, 10, 20, 30, 40
  categoryId: string | null;
  onlyFreeShipping: boolean;
  onlyFull: boolean;
  minPrice: string;
  maxPrice: string;
}

interface CategoryOption {
  id: string;
  name: string;
  count: number;
}

interface DealsFiltersProps {
  filters: DealsFilterState;
  onFilterChange: (newFilters: Partial<DealsFilterState>) => void;
  onResetFilters: () => void;
  categories: CategoryOption[];
  hasActiveFilters: boolean;
}

export function DealsFilters({
  filters,
  onFilterChange,
  onResetFilters,
  categories,
  hasActiveFilters,
}: DealsFiltersProps) {
  const discountTiers = [
    { value: 0, label: 'Cualquier descuento' },
    { value: 10, label: 'Desde 10% OFF' },
    { value: 20, label: 'Desde 20% OFF' },
    { value: 30, label: 'Desde 30% OFF' },
    { value: 40, label: 'Desde 40% OFF' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-6">
      {/* Cabecera de Filtros */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <TbFilter size={18} className="text-[#3483fa]" />
          <h2 className="text-xs sm:text-sm font-bold text-gray-900">Filtrar Ofertas</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-bold text-[#3483fa] hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <TbX size={13} />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* 1. Porcentaje de Descuento */}
      <div>
        <h3 className="text-xs font-bold text-gray-800 mb-2.5 flex items-center gap-1.5">
          <TbPercentage size={15} className="text-emerald-600" />
          <span>Porcentaje de Descuento</span>
        </h3>
        <div className="space-y-1.5">
          {discountTiers.map((tier) => (
            <label
              key={tier.value}
              className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filters.minDiscount === tier.value
                  ? 'bg-blue-50 text-[#3483fa] font-bold'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="minDiscount"
                  checked={filters.minDiscount === tier.value}
                  onChange={() => onFilterChange({ minDiscount: tier.value })}
                  className="text-[#3483fa] focus:ring-blue-200"
                />
                <span>{tier.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Categorías con ofertas */}
      {categories.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-800 mb-2.5">
            Categorías
          </h3>
          <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => onFilterChange({ categoryId: null })}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                filters.categoryId === null
                  ? 'bg-blue-50 text-[#3483fa] font-bold'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span>Todas las categorías</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onFilterChange({ categoryId: cat.id })}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  filters.categoryId === cat.id
                    ? 'bg-blue-50 text-[#3483fa] font-bold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded-full font-semibold shrink-0 ml-1">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Beneficios de Envío */}
      <div className="pt-2 border-t border-gray-100 space-y-2.5">
        <h3 className="text-xs font-bold text-gray-800 mb-1">
          Opciones de Envío
        </h3>

        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900 select-none">
          <input
            type="checkbox"
            checked={filters.onlyFreeShipping}
            onChange={(e) => onFilterChange({ onlyFreeShipping: e.target.checked })}
            className="rounded border-gray-300 text-[#00a650] focus:ring-emerald-200"
          />
          <TbTruckDelivery size={16} className="text-[#00a650]" />
          <span>Envío gratis</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900 select-none">
          <input
            type="checkbox"
            checked={filters.onlyFull}
            onChange={(e) => onFilterChange({ onlyFull: e.target.checked })}
            className="rounded border-gray-300 text-[#00a650] focus:ring-emerald-200"
          />
          <TbBolt size={16} className="text-[#00a650]" />
          <span>Envío FULL inmediato</span>
        </label>
      </div>

      {/* 4. Rango de Precio */}
      <div className="pt-2 border-t border-gray-100">
        <h3 className="text-xs font-bold text-gray-800 mb-2">
          Precio (S/)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Mínimo"
            value={filters.minPrice}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#3483fa]"
          />
          <span className="text-gray-400 text-xs">-</span>
          <input
            type="number"
            min="0"
            placeholder="Máximo"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#3483fa]"
          />
        </div>
      </div>
    </div>
  );
}

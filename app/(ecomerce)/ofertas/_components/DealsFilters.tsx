'use client';

import React from 'react';
import { TbFilter, TbX, TbTruckDelivery, TbBolt, TbPercentage } from 'react-icons/tb';

export interface DealsFilterState {
  minDiscount: number;
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
    <div className="bg-white rounded-none border border-[#d9d9d9] p-4 sm:p-5 space-y-6">
      {/* Cabecera de Filtros */}
      <div className="flex items-center justify-between pb-3 border-b border-[#d9d9d9]">
        <div className="flex items-center gap-2">
          <TbFilter size={17} className="text-brand-accent" />
          <h2 className="font-display text-sm font-extrabold uppercase tracking-tight text-black">
            Filtrar Promos
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-bold uppercase tracking-wider text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
          >
            <TbX size={13} />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* 1. Porcentaje de Descuento */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-black mb-2.5 flex items-center gap-1.5">
          <TbPercentage size={14} className="text-brand-accent" />
          <span>Porcentaje de Descuento</span>
        </h3>
        <div className="space-y-1">
          {discountTiers.map((tier) => {
            const active = filters.minDiscount === tier.value;
            return (
              <label
                key={tier.value}
                className={`flex items-center justify-between px-2.5 py-2 rounded-none text-xs cursor-pointer transition-colors ${
                  active
                    ? 'bg-black text-white font-bold'
                    : 'hover:bg-[#f8f8f8] text-neutral-700 font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="minDiscount"
                    checked={active}
                    onChange={() => onFilterChange({ minDiscount: tier.value })}
                    className="accent-brand-accent cursor-pointer"
                  />
                  <span>{tier.label}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Categorías con ofertas */}
      {categories.length > 0 && (
        <div className="pt-4 border-t border-[#d9d9d9]">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-black mb-2.5">
            Categorías
          </h3>
          <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => onFilterChange({ categoryId: null })}
              className={`w-full text-left px-2.5 py-1.5 rounded-none text-xs flex items-center justify-between transition-colors cursor-pointer ${
                filters.categoryId === null
                  ? 'bg-black text-white font-bold'
                  : 'hover:bg-[#f8f8f8] text-neutral-700'
              }`}
            >
              <span>Todas las categorías</span>
            </button>
            {categories.map((cat) => {
              const active = filters.categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onFilterChange({ categoryId: cat.id })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-none text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    active
                      ? 'bg-black text-white font-bold'
                      : 'hover:bg-[#f8f8f8] text-neutral-700'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-none font-bold shrink-0 ml-1 ${
                      active ? 'bg-brand-accent text-white' : 'bg-[#f8f8f8] text-neutral-500 border border-[#d9d9d9]'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Beneficios de Envío */}
      <div className="pt-4 border-t border-[#d9d9d9] space-y-2.5">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-black mb-1">
          Opciones de Envío
        </h3>

        <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer hover:text-black select-none">
          <input
            type="checkbox"
            checked={filters.onlyFreeShipping}
            onChange={(e) => onFilterChange({ onlyFreeShipping: e.target.checked })}
            className="w-4 h-4 rounded-none accent-brand-accent cursor-pointer"
          />
          <TbTruckDelivery size={16} className="text-[#2e9e7b]" />
          <span>Envío gratis</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer hover:text-black select-none">
          <input
            type="checkbox"
            checked={filters.onlyFull}
            onChange={(e) => onFilterChange({ onlyFull: e.target.checked })}
            className="w-4 h-4 rounded-none accent-brand-accent cursor-pointer"
          />
          <TbBolt size={16} className="text-[#2e9e7b]" />
          <span>Envío EXPRESS inmediato</span>
        </label>
      </div>

      {/* 4. Rango de Precio */}
      <div className="pt-4 border-t border-[#d9d9d9]">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-black mb-2">
          Precio (S/)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Mínimo"
            value={filters.minPrice}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            className="w-full px-2.5 py-2 bg-white border border-[#d9d9d9] rounded-none text-xs text-black focus:outline-none focus:border-black"
          />
          <span className="text-neutral-400 text-xs">-</span>
          <input
            type="number"
            min="0"
            placeholder="Máximo"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            className="w-full px-2.5 py-2 bg-white border border-[#d9d9d9] rounded-none text-xs text-black focus:outline-none focus:border-black"
          />
        </div>
      </div>
    </div>
  );
}

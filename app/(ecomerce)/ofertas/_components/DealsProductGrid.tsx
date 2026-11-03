'use client';

import React from 'react';
import { ProductCard } from '../../_components/ProductCard';
import { Product } from '@/types/product.types';
import { TbArrowsSort, TbTagOff, TbFilter } from 'react-icons/tb';

export type DealsSortOption = 'discount_desc' | 'price_asc' | 'price_desc' | 'newest';

interface DealsProductGridProps {
  products: Product[];
  sortBy: DealsSortOption;
  onSortChange: (sort: DealsSortOption) => void;
  onOpenMobileFilters?: () => void;
  onResetFilters: () => void;
}

export function DealsProductGrid({
  products,
  sortBy,
  onSortChange,
  onOpenMobileFilters,
  onResetFilters,
}: DealsProductGridProps) {
  return (
    <div className="space-y-4">
      {/* Barra Superior de la Cuadrícula: Conteo y Ordenamiento */}
      <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <p className="text-xs sm:text-sm text-gray-700">
            <span className="font-bold text-gray-900">{products.length}</span> {products.length === 1 ? 'producto en oferta' : 'productos en oferta'}
          </p>

          {/* Botón de Filtros para Móviles */}
          {onOpenMobileFilters && (
            <button
              type="button"
              onClick={onOpenMobileFilters}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <TbFilter size={14} />
              <span>Filtros</span>
            </button>
          )}
        </div>

        {/* Selector de Orden */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label htmlFor="deals-sort" className="text-xs text-gray-500 font-medium flex items-center gap-1">
            <TbArrowsSort size={14} />
            <span className="hidden sm:inline">Ordenar por:</span>
          </label>
          <select
            id="deals-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as DealsSortOption)}
            className="px-2.5 py-1.5 bg-slate-50 border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-2xs"
          >
            <option value="discount_desc">Mayor descuento (% OFF)</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="newest">Más recientes</option>
          </select>
        </div>
      </div>

      {/* Grid de Productos o Estado Vacío */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mb-3">
            <TbTagOff size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            No se encontraron ofertas con estos filtros
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
            Intenta seleccionar un porcentaje de descuento menor o limpiar los filtros activos para ver todas las promociones.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Ver todas las ofertas
          </button>
        </div>
      )}
    </div>
  );
}

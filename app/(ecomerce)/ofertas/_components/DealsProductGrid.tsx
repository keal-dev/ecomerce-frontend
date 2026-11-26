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
      <div className="bg-[#f8f8f8] px-4 py-3 rounded-none border border-[#d9d9d9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <p className="text-xs sm:text-sm text-neutral-600">
            <span className="font-bold text-black">{products.length}</span>{' '}
            {products.length === 1 ? 'producto en oferta' : 'productos en oferta'}
          </p>

          {/* Botón de Filtros para Móviles */}
          {onOpenMobileFilters && (
            <button
              type="button"
              onClick={onOpenMobileFilters}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-black hover:bg-[#de2a2a] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer"
            >
              <TbFilter size={14} />
              <span>Filtros</span>
            </button>
          )}
        </div>

        {/* Selector de Orden */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label
            htmlFor="deals-sort"
            className="text-xs text-neutral-500 font-medium flex items-center gap-1"
          >
            <TbArrowsSort size={14} className="text-black" />
            <span className="hidden sm:inline">Ordenar por:</span>
          </label>
          <select
            id="deals-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as DealsSortOption)}
            className="px-3 py-2 bg-white border border-[#d9d9d9] focus:border-black rounded-none text-xs font-bold text-black focus:outline-none transition-colors cursor-pointer"
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
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                title: p.title,
                slug: p.slug,
                price: Number(p.price),
                originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
                discount: p.discount ? Number(p.discount) : null,
                freeShipping: p.freeShipping ?? false,
                full: p.full ?? false,
                imageUrl: p.imageUrl || '/placeholder.png',
                description: p.description,
                stock: p.stock,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-8 sm:p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-none bg-black text-white flex items-center justify-center mb-4">
            <TbTagOff size={28} />
          </div>
          <h3 className="font-display text-base sm:text-lg font-extrabold uppercase text-black mb-1">
            No se encontraron ofertas con estos filtros
          </h3>
          <p className="text-xs text-neutral-600 max-w-md mx-auto mb-5">
            Intenta seleccionar un porcentaje de descuento menor o limpiar los filtros activos para ver todas las promociones.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="px-6 py-2.5 bg-[#de2a2a] hover:bg-red-700 text-white rounded-none text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
          >
            Ver todas las ofertas
          </button>
        </div>
      )}
    </div>
  );
}

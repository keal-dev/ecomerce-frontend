'use client';

import React from 'react';
import Link from 'next/link';
import { TbSearchOff, TbFlame, TbHome, TbRotateClockwise } from 'react-icons/tb';
import { Product } from '@/types/product.types';
import { ProductCard } from '@/app/(ecomerce)/_components/ProductCard';

interface SearchEmptyStateProps {
  query: string;
  hasFilters: boolean;
  onResetFilters: () => void;
  recommendedProducts: Product[];
}

export const SearchEmptyState = ({
  query,
  hasFilters,
  onResetFilters,
  recommendedProducts,
}: SearchEmptyStateProps) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-8 sm:p-12 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 bg-blue-50 text-[#3483fa] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <TbSearchOff size={32} />
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          No hay publicaciones que coincidan con tu búsqueda
        </h2>

        {query && (
          <p className="text-xs text-gray-600 mt-1.5 font-medium">
            Término buscado: <span className="text-gray-900 font-bold">&quot;{query}&quot;</span>
          </p>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded-xl text-left text-xs text-gray-600 space-y-1.5 font-light">
          <p className="font-semibold text-gray-800">Sugerencias para tu búsqueda:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-gray-500">
            <li>Revisa la ortografía de las palabras.</li>
            <li>Utiliza términos más genéricos o menos palabras clave.</li>
            <li>Navega por las categorías del menú para explorar productos.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {hasFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-4 py-2 bg-blue-50 text-[#3483fa] hover:bg-blue-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <TbRotateClockwise size={14} />
              <span>Restablecer filtros</span>
            </button>
          )}

          <Link
            href="/ofertas"
            className="px-4 py-2 bg-[#3483fa] hover:bg-[#2968c8] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <TbFlame size={14} />
            <span>Ver ofertas del día</span>
          </Link>

          <Link
            href="/"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <TbHome size={14} />
            <span>Ir al inicio</span>
          </Link>
        </div>
      </div>

      {/* Productos recomendados */}
      {recommendedProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <TbFlame className="text-[#00a650]" size={20} />
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              Productos recomendados para ti
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {recommendedProducts.slice(0, 10).map((p) => {
              const cardProduct = {
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
              };

              return <ProductCard key={p.id} product={cardProduct} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

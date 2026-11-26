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
    <div className="space-y-10">
      <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-8 sm:p-12 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 bg-black text-white rounded-none flex items-center justify-center mx-auto mb-5">
          <TbSearchOff size={32} />
        </div>

        <h2 className="font-display text-lg sm:text-xl font-extrabold uppercase tracking-tight text-black">
          No hay resultados que coincidan con tu búsqueda
        </h2>

        {query && (
          <p className="text-xs text-neutral-600 mt-1.5 font-medium">
            Término buscado: <span className="text-black font-bold">&quot;{query}&quot;</span>
          </p>
        )}

        <div className="mt-4 p-4 bg-white rounded-none border border-[#d9d9d9] text-left text-xs text-neutral-600 space-y-1.5">
          <p className="font-bold uppercase tracking-wider text-black text-[11px]">
            Sugerencias para tu búsqueda:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-neutral-500">
            <li>Revisa la ortografía del producto o marca.</li>
            <li>Utiliza términos más genéricos (ej. vino, chocolate, cacao, café).</li>
            <li>Navega por las categorías del menú para explorar el catálogo completo.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {hasFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-4 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <TbRotateClockwise size={14} />
              <span>Restablecer filtros</span>
            </button>
          )}

          <Link
            href="/ofertas"
            className="px-5 py-2.5 bg-brand-accent hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-none transition-colors flex items-center gap-1.5"
          >
            <TbFlame size={14} />
            <span>Ver ofertas</span>
          </Link>

          <Link
            href="/"
            className="px-5 py-2.5 border border-black bg-white hover:bg-black hover:text-white text-black text-xs font-bold uppercase tracking-widest rounded-none transition-colors flex items-center gap-1.5"
          >
            <TbHome size={14} />
            <span>Ir al inicio</span>
          </Link>
        </div>
      </div>

      {/* Productos recomendados */}
      {recommendedProducts.length > 0 && (
        <div className="bg-white rounded-none border border-[#d9d9d9] p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#d9d9d9]">
            <TbFlame className="text-brand-accent" size={20} />
            <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-black">
              Recomendados de nuestra cooperativa
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
                stock: p.stock,
              };

              return <ProductCard key={p.id} product={cardProduct} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

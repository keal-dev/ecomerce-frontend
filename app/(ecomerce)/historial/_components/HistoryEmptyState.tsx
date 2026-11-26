'use client';

import React from 'react';
import Link from 'next/link';
import { TbHistoryOff, TbFlame, TbShoppingBag } from 'react-icons/tb';
import { Product } from '@/types/product.types';
import { ProductCard } from '@/app/(ecomerce)/_components/ProductCard';

interface HistoryEmptyStateProps {
  recommendedProducts: Product[];
}

export const HistoryEmptyState = ({ recommendedProducts }: HistoryEmptyStateProps) => {
  return (
    <div className="space-y-10">
      {/* Caja de estado vacío */}
      <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-8 sm:p-12 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-black text-white rounded-none flex items-center justify-center mx-auto mb-5">
          <TbHistoryOff size={32} />
        </div>

        <h2 className="font-display text-lg sm:text-xl font-extrabold uppercase tracking-tight text-black">
          Tu historial de navegación está vacío
        </h2>

        <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-md mx-auto leading-relaxed">
          A medida que explores vinos, chocolates, cacao y café en nuestro catálogo, los guardaremos aquí automáticamente.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/ofertas"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#de2a2a] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-none transition-colors"
          >
            <TbFlame size={16} />
            <span>Descubrir ofertas</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-black bg-white hover:bg-black hover:text-white text-black text-xs font-bold uppercase tracking-widest rounded-none transition-colors"
          >
            <TbShoppingBag size={16} />
            <span>Ir a la tienda</span>
          </Link>
        </div>
      </div>

      {/* Sección de productos recomendados */}
      {recommendedProducts.length > 0 && (
        <div className="bg-white rounded-none border border-[#d9d9d9] p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#d9d9d9]">
            <TbFlame className="text-[#de2a2a]" size={20} />
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

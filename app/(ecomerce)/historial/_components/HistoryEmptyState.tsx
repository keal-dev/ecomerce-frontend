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
    <div className="space-y-8">
      {/* Caja de estado vacío */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-8 sm:p-12 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 text-[#3483fa] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-2xs">
          <TbHistoryOff size={36} className="text-[#3483fa]" />
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          Tu historial de navegación está vacío
        </h2>

        <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed font-light">
          A medida que explores publicaciones y detalles de productos, los guardaremos aquí automáticamente para que los encuentres con rapidez.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/ofertas"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3483fa] hover:bg-[#2968c8] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <TbFlame size={18} />
            <span>Descubrir ofertas</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-medium rounded-xl transition-colors"
          >
            <TbShoppingBag size={18} />
            <span>Ir a la tienda</span>
          </Link>
        </div>
      </div>

      {/* Sección de productos recomendados para que la página sea atractiva */}
      {recommendedProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <TbFlame className="text-[#00a650]" size={22} />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
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

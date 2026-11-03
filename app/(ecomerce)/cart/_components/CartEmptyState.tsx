'use client';

import React from 'react';
import Link from 'next/link';
import { TbShoppingCartOff, TbFlame, TbHome } from 'react-icons/tb';
import { Product } from '@/types/product.types';
import { ProductCard } from '@/app/(ecomerce)/_components/ProductCard';

interface CartEmptyStateProps {
  recommendedProducts: Product[];
}

export const CartEmptyState = ({ recommendedProducts }: CartEmptyStateProps) => {
  return (
    <div className="space-y-8">
      {/* Caja de estado vacío */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-8 sm:p-12 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 bg-blue-50 text-[#3483fa] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <TbShoppingCartOff size={34} />
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          Tu carrito está vacío
        </h2>

        <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed font-light">
          ¿Aún no sabes qué comprar? Tenemos miles de publicaciones con precios increíbles esperándote.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/ofertas"
            className="px-5 py-2.5 bg-[#3483fa] hover:bg-[#2968c8] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <TbFlame size={16} />
            <span>Descubrir ofertas</span>
          </Link>

          <Link
            href="/"
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <TbHome size={16} />
            <span>Ir a la tienda</span>
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

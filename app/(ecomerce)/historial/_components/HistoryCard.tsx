'use client';

import React from 'react';
import Link from 'next/link';
import { FaBolt, FaStar } from 'react-icons/fa6';
import { TbTrash } from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';
import { Product } from '@/types/product.types';

interface HistoryCardProps {
  product: Product;
  onRemove: (id: string) => void;
}

function getProductRating(id: string): { rating: number; count: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const rating = 4.3 + (positive % 8) * 0.1;
  const count = 15 + (positive % 85);
  return {
    rating: Number(rating.toFixed(1)),
    count,
  };
}

export const HistoryCard = ({ product, onRemove }: HistoryCardProps) => {
  const { company } = useCompanyStore();
  const symbol = company?.currencySymbol || 'S/';
  const href = `/product/${product.slug || product.id}`;

  const ratingInfo = getProductRating(product.id || 'default');

  const discountPercent =
    product.discount && product.discount > 0
      ? Number(product.discount)
      : product.originalPrice && Number(product.originalPrice) > Number(product.price)
      ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
      : 0;

  const [priceInt, priceDec] = Number(product.price || 0).toFixed(2).split('.');

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(product.id);
  };

  return (
    <div className="relative group bg-white rounded-xl border border-gray-200/90 hover:border-gray-300 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden">
      {/* Botón flotante para eliminar este producto del historial */}
      <button
        type="button"
        onClick={handleRemove}
        title="Eliminar de mi historial"
        aria-label="Eliminar del historial"
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 hover:bg-rose-50 text-gray-400 hover:text-rose-600 shadow-xs border border-gray-200/80 hover:border-rose-200 transition-all cursor-pointer opacity-70 group-hover:opacity-100"
      >
        <TbTrash size={15} />
      </button>

      <Link href={href} className="flex flex-col flex-1">
        {/* Imagen con padding */}
        <div className="w-full aspect-square max-h-48 p-4 bg-white flex items-center justify-center border-b border-gray-100/80 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl || '/placeholder.png'}
            alt={product.title}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        <div className="p-3.5 flex flex-col flex-grow justify-between">
          <div>
            {/* Calificación de estrellas */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={11}
                    className={star <= Math.round(ratingInfo.rating) ? 'text-amber-400' : 'text-gray-200'}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-700 leading-none">
                {ratingInfo.rating}
              </span>
              <span className="text-[11px] text-gray-400 leading-none">
                ({ratingInfo.count})
              </span>
            </div>

            {/* Título */}
            <h3 className="text-gray-800 text-xs sm:text-sm font-normal line-clamp-2 leading-snug group-hover:text-[#3483fa] transition-colors">
              {product.title}
            </h3>

            {/* Categoría si existe */}
            {product.category?.name && (
              <span className="inline-block text-[11px] text-gray-400 mt-1 font-light">
                {product.category.name}
              </span>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-50">
            {/* Precio tachado si hay oferta */}
            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
              <span className="text-gray-400 text-xs line-through block leading-none mb-1">
                {symbol} {Number(product.originalPrice).toFixed(2)}
              </span>
            )}

            {/* Precio actual y descuento */}
            <div className="flex items-baseline gap-2 mb-1.5">
              <div className="flex items-start text-gray-900 font-semibold tracking-tight">
                <span className="text-xs sm:text-[13px] mr-0.5">{symbol}</span>
                <span className="text-base sm:text-lg leading-tight">{priceInt}</span>
                <span className="text-[10px] sm:text-[11px] leading-tight font-medium ml-0.5">
                  {priceDec}
                </span>
              </div>
              {discountPercent > 0 && (
                <span className="text-[#00a650] text-[10.5px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Badges de envío */}
            <div className="flex items-center gap-2 min-h-[18px]">
              {product.freeShipping && (
                <span className="text-[#00a650] text-xs font-semibold leading-tight">
                  Envío gratis
                </span>
              )}
              {product.full && (
                <span className="text-[#00a650] text-xs font-bold italic flex items-center leading-tight">
                  <FaBolt size={10} className="mr-0.5" /> FULL
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

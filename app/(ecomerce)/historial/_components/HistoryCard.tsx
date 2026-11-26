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
        ? Math.round(
            ((Number(product.originalPrice) - Number(product.price)) /
              Number(product.originalPrice)) *
              100,
          )
        : 0;

  const [priceInt, priceDec] = Number(product.price || 0).toFixed(2).split('.');

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(product.id);
  };

  return (
    <div className="relative group bg-white rounded-none border border-[#d9d9d9] hover:border-black transition-all duration-200 flex flex-col h-full overflow-hidden">
      {/* Botón flotante para eliminar este producto del historial */}
      <button
        type="button"
        onClick={handleRemove}
        title="Eliminar de mi historial"
        aria-label="Eliminar del historial"
        className="absolute top-2 right-2 z-10 p-1.5 rounded-none bg-white hover:bg-brand-accent text-neutral-500 hover:text-white border border-[#d9d9d9] hover:border-brand-accent transition-all cursor-pointer"
      >
        <TbTrash size={14} />
      </button>

      {discountPercent > 0 && (
        <span className="absolute top-2 left-2 z-10 bg-brand-accent text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none">
          -{discountPercent}%
        </span>
      )}

      <Link href={href} className="flex flex-col flex-1">
        {/* Imagen con fondo editorial neutro */}
        <div className="w-full aspect-square max-h-48 p-4 bg-[#f8f8f8] flex items-center justify-center border-b border-[#d9d9d9] shrink-0">
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
                    size={10}
                    className={star <= Math.round(ratingInfo.rating) ? 'text-amber-400' : 'text-neutral-200'}
                  />
                ))}
              </div>
              <span className="text-[11px] font-bold text-black leading-none">
                {ratingInfo.rating}
              </span>
              <span className="text-[10px] text-neutral-400 leading-none">
                ({ratingInfo.count})
              </span>
            </div>

            {/* Título */}
            <h3 className="text-black text-xs sm:text-sm font-bold line-clamp-2 leading-snug group-hover:text-brand-accent transition-colors">
              {product.title}
            </h3>

            {/* Categoría si existe */}
            {product.category?.name && (
              <span className="inline-block text-[10px] uppercase tracking-wider text-neutral-500 mt-1 font-medium">
                {product.category.name}
              </span>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#d9d9d9]">
            {/* Precio tachado si hay oferta */}
            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
              <span className="text-neutral-400 text-xs line-through block leading-none mb-1">
                {symbol} {Number(product.originalPrice).toFixed(2)}
              </span>
            )}

            {/* Precio actual */}
            <div className="flex items-baseline gap-2 mb-1.5">
              <div className="flex items-start text-black font-extrabold tracking-tight">
                <span className="text-xs mr-0.5">{symbol}</span>
                <span className="text-base sm:text-lg leading-tight">{priceInt}</span>
                <span className="text-[10px] leading-tight font-bold ml-0.5">
                  {priceDec}
                </span>
              </div>
            </div>

            {/* Badges de envío */}
            <div className="flex items-center gap-2 min-h-[18px]">
              {product.freeShipping && (
                <span className="text-[#2e9e7b] text-[10px] font-bold uppercase tracking-wider leading-tight">
                  Envío gratis
                </span>
              )}
              {product.full && (
                <span className="text-[#2e9e7b] text-[10px] font-bold italic uppercase flex items-center leading-tight">
                  <FaBolt size={9} className="mr-0.5" /> EXPRESS
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

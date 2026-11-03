'use client';

import React from 'react';
import Link from 'next/link';
import { FaBolt, FaStar, FaHeart } from 'react-icons/fa6';
import { useCompanyStore } from '@/stores/company.store';
import { useRecentlyViewedStore } from '@/stores/recently-viewed.store';
import { useFavoritesStore } from '@/stores/favorites.store';

export interface Product {
  id: string;
  title: string;
  slug?: string | null;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  freeShipping: boolean;
  full: boolean;
  imageUrl: string;
  description?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
}

// Generador determinista de calificación si no viene de base de datos
function getProductRating(id: string): { rating: number; count: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const rating = 4.3 + (positive % 8) * 0.1; // entre 4.3 y 5.0
  const count = 15 + (positive % 85); // entre 15 y 99 reseñas
  return {
    rating: Number(rating.toFixed(1)),
    count,
  };
}

export const ProductCard = ({ product }: { product: Product }) => {
  const { company } = useCompanyStore();
  const { addViewedId } = useRecentlyViewedStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const isFav = isFavorite(product.id);

  const symbol = company?.currencySymbol || 'S/';
  const href = `/product/${product.slug || product.id}`;

  const { rating, count } = product.rating
    ? { rating: product.rating, count: product.reviewCount || 10 }
    : getProductRating(product.id || 'default');

  const handleClick = () => {
    addViewedId(product.id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const [priceInt, priceDec] = Number(product.price || 0).toFixed(2).split('.');

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="bg-white rounded-xl shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col h-full border border-gray-100 overflow-hidden hover:-translate-y-0.5"
    >
      {/* Imagen del producto más estilizada y menos ancha */}
      <div className="w-full aspect-square max-h-44 p-3 bg-white flex items-center justify-center border-b border-gray-100/80 shrink-0 relative">
        {/* Botón flotante de favoritos */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className={`absolute top-2 right-2 p-1.5 rounded-full z-10 transition-all cursor-pointer ${
            isFav
              ? 'bg-rose-50 text-rose-500 shadow-2xs'
              : 'bg-white/80 hover:bg-white text-gray-300 hover:text-rose-500 shadow-2xs opacity-0 group-hover:opacity-100'
          }`}
        >
          <FaHeart size={13} className={isFav ? 'fill-rose-500 text-rose-500' : ''} />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="p-3 flex flex-col flex-grow justify-between">
        <div>
          {/* Estrellas y calificación */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={11}
                  className={star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-700 leading-none">{rating}</span>
            <span className="text-[11px] text-gray-400 leading-none">({count})</span>
          </div>

          {/* Título del producto */}
          <h3 className="text-gray-800 text-xs sm:text-sm font-normal line-clamp-2 leading-snug group-hover:text-[#3483fa] transition-colors">
            {product.title}
          </h3>

          {/* Descripción corta */}
          {product.description && (
            <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed font-light">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-gray-50">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-gray-400 text-xs line-through block leading-none mb-1">
              {symbol} {Number(product.originalPrice).toFixed(2)}
            </span>
          )}

          <div className="flex items-baseline gap-1.5 mb-1">
            <div className="flex items-start text-gray-900 font-semibold tracking-tight">
              <span className="text-xs sm:text-[13px] mr-0.5">{symbol}</span>
              <span className="text-base sm:text-lg leading-tight">{priceInt}</span>
              <span className="text-[10px] sm:text-[11px] leading-tight font-medium ml-0.5">{priceDec}</span>
            </div>
            {product.discount && product.discount > 0 ? (
              <span className="text-[#00a650] text-[10.5px] font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                {product.discount}% OFF
              </span>
            ) : null}
          </div>
          
          <div className="mt-1 flex flex-col gap-1 min-h-[18px]">
            <div className="flex items-center gap-2">
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
      </div>
    </Link>
  );
};

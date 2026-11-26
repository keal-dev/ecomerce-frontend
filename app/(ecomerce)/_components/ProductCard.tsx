'use client';

import React from 'react';
import Link from 'next/link';
import { FaHeart } from 'react-icons/fa6';
import { TbPlus } from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';
import { useRecentlyViewedStore } from '@/stores/recently-viewed.store';
import { useFavoritesStore } from '@/stores/favorites.store';
import { useCartStore } from '@/stores/cart.store';

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
  stock?: number;
  rating?: number | null;
  reviewCount?: number | null;
}

export const ProductCard = ({ product }: { product: Product }) => {
  const { company } = useCompanyStore();
  const { addViewedId } = useRecentlyViewedStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);

  const isFav = isFavorite(product.id);
  const symbol = company?.currencySymbol || 'S/';
  const href = `/product/${product.slug || product.id}`;
  const isOutOfStock = product.stock !== undefined && Number(product.stock) <= 0;
  const hasDiscount = Boolean(
    (product.discount && product.discount > 0) ||
      (product.originalPrice && product.originalPrice > product.price),
  );

  const handleClick = () => {
    addViewedId(product.id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(
      {
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: Number(product.price) || 0,
        originalPrice: product.originalPrice ?? null,
        discount: product.discount ?? null,
        imageUrl: product.imageUrl,
        stock: product.stock,
        freeShipping: product.freeShipping,
        full: product.full,
      },
      1,
    );
    openDrawer();
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="bg-white border border-[#e5e5e5] hover:border-black transition-colors duration-200 cursor-pointer group flex flex-col h-full overflow-hidden rounded-none"
    >
      {/* Contenedor cuadrado de botella */}
      <div className="w-full aspect-square bg-[#f8f8f8] flex items-center justify-center relative overflow-hidden p-4 shrink-0">
        {/* Badge de oferta / agotado */}
        {isOutOfStock ? (
          <span className="absolute top-2.5 left-2.5 z-10 bg-[#6f719b] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none">
            AGOTADO
          </span>
        ) : product.discount && product.discount > 0 ? (
          <span className="absolute top-2.5 left-2.5 z-10 bg-[#de2a2a] text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-none">
            -{product.discount}%
          </span>
        ) : null}

        {/* Favoritos */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className={`absolute top-2.5 right-2.5 p-1.5 z-10 transition-all cursor-pointer ${
            isFav
              ? 'bg-white text-[#de2a2a] shadow-xs'
              : 'bg-white/85 hover:bg-white text-neutral-400 hover:text-[#de2a2a] opacity-0 group-hover:opacity-100'
          }`}
        >
          <FaHeart size={13} className={isFav ? 'fill-[#de2a2a] text-[#de2a2a]' : ''} />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl || '/placeholder.png'}
          alt={product.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/placeholder.png';
          }}
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Info del Producto */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="text-[#020202] text-[13px] sm:text-sm font-semibold line-clamp-2 leading-snug group-hover:text-[#de2a2a] transition-colors">
            {product.title}
          </h3>
          <p className="text-[11px] text-neutral-500 line-clamp-1 mt-1">
            {product.description?.trim() || `${product.title} • Producto original garantizado.`}
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <span
              className={`text-base sm:text-[17px] font-extrabold tracking-tight ${
                hasDiscount ? 'text-[#de2a2a]' : 'text-black'
              }`}
            >
              {symbol} {Number(product.price || 0).toFixed(2)}
            </span>

            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-neutral-400 text-xs line-through">
                {symbol} {Number(product.originalPrice).toFixed(2)}
              </span>
            )}

            {product.freeShipping && (
              <span className="text-[#2e9e7b] text-[10px] font-bold uppercase tracking-wider ml-auto">
                Envío gratis
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            className="w-full h-10 bg-black hover:bg-[#de2a2a] disabled:bg-[#6f719b] text-white text-[11px] font-bold uppercase tracking-widest rounded-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {isOutOfStock ? (
              <span>AGOTADO</span>
            ) : (
              <>
                <TbPlus size={14} />
                <span>AGREGAR</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};

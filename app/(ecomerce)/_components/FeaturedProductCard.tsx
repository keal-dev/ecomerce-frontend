'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from './ProductCard';
import { TbClock, TbFlame, TbPlus } from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';
import { useRecentlyViewedStore } from '@/stores/recently-viewed.store';
import { useCartStore } from '@/stores/cart.store';

export const FeaturedProductCard = ({ product }: { product: Product }) => {
  const { company } = useCompanyStore();
  const { addViewedId } = useRecentlyViewedStore();
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);

  const symbol = company?.currencySymbol || 'S/';
  const href = `/product/${product.slug || product.id}`;
  const isOutOfStock = product.stock !== undefined && Number(product.stock) <= 0;

  const handleQuickAdd = () => {
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
    <div className="col-span-2 sm:col-span-3 md:col-span-2 bg-white border border-[#e5e5e5] hover:border-black transition-colors overflow-hidden group flex flex-col justify-between relative rounded-none">
      {/* Top Banner Tag */}
      <div className="bg-black text-white px-4 py-2.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <TbFlame size={15} className="text-[#de2a2a]" /> OFERTA DESTACADA
        </span>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#f3ff34]">
          <TbClock size={13} /> POR TIEMPO LIMITADO
        </span>
      </div>

      <div className="p-5 flex flex-col md:flex-row gap-5 items-center flex-1">
        {/* Large Product Image */}
        <Link
          href={href}
          onClick={() => addViewedId(product.id)}
          className="w-full md:w-1/2 aspect-square max-h-60 flex items-center justify-center p-4 bg-[#f8f8f8] overflow-hidden shrink-0 relative"
        >
          {product.discount && product.discount > 0 ? (
            <span className="absolute top-2.5 left-2.5 bg-[#de2a2a] text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5">
              -{product.discount}%
            </span>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl || '/placeholder.png'}
            alt={product.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/placeholder.png';
            }}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between w-full">
          <div>
            {product.freeShipping && (
              <span className="inline-block text-[#2e9e7b] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                ENVÍO GRATIS
              </span>
            )}

            <Link href={href} onClick={() => addViewedId(product.id)}>
              <h3 className="font-display text-base md:text-lg font-extrabold uppercase text-black line-clamp-2 leading-tight group-hover:text-[#de2a2a] transition-colors mb-2">
                {product.title}
              </h3>
            </Link>

            <p className="text-xs text-neutral-600 line-clamp-2 mb-3 leading-relaxed">
              {product.description?.trim() || `${product.title} con garantía de autenticidad y entrega rápida.`}
            </p>

            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-neutral-400 text-xs line-through block mb-0.5">
                {symbol} {Number(product.originalPrice).toFixed(2)}
              </span>
            )}

            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#de2a2a] tracking-tight">
                {symbol} {Number(product.price || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleQuickAdd}
              className="h-11 bg-[#de2a2a] hover:bg-red-700 disabled:bg-[#6f719b] text-white font-bold text-[11px] uppercase tracking-widest rounded-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <TbPlus size={15} />
              <span>{isOutOfStock ? 'AGOTADO' : 'AGREGAR'}</span>
            </button>

            <Link
              href={href}
              onClick={() => addViewedId(product.id)}
              className="h-11 bg-black hover:bg-neutral-800 text-white font-bold text-[11px] uppercase tracking-widest rounded-none transition-colors flex items-center justify-center"
            >
              VER PRODUCTO
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

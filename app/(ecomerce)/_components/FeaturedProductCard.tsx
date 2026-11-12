import React from 'react';
import Link from 'next/link';
import { Product } from './ProductCard';
import { FaBolt } from 'react-icons/fa6';
import { TbClock, TbFlame } from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';
import { useRecentlyViewedStore } from '@/stores/recently-viewed.store';

export const FeaturedProductCard = ({ product }: { product: Product }) => {
  const { company } = useCompanyStore();
  const { addViewedId } = useRecentlyViewedStore();
  const symbol = company?.currencySymbol || 'S/';
  const href = `/product/${product.slug || product.id}`;
  const [priceInt, priceDec] = Number(product.price || 0).toFixed(2).split('.');

  return (
    <div className="col-span-2 sm:col-span-3 md:col-span-2 bg-white rounded-xl shadow-2xs hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col justify-between relative">
      {/* Top Banner Tag */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1.5 uppercase tracking-wide">
          <TbFlame size={16} className="text-yellow-300" /> Oferta Destacada
        </span>
        <span className="flex items-center gap-1 text-[11px] font-normal opacity-90">
          <TbClock size={14} /> Termina hoy
        </span>
      </div>

      <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-center flex-1">
        {/* Large Product Image */}
        <Link 
          href={href}
          onClick={() => addViewedId(product.id)}
          className="w-full md:w-1/2 aspect-square max-h-56 flex items-center justify-center p-3 bg-gray-50/60 rounded-lg overflow-hidden flex-shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'} 
            alt={product.title} 
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80';
            }}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.freeShipping && (
                <span className="text-[#00a650] text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Envío gratis
                </span>
              )}
              {product.full && (
                <span className="text-[#00a650] text-xs font-bold italic flex items-center">
                  <FaBolt size={11} className="mr-0.5" /> FULL
                </span>
              )}
            </div>

            <Link 
              href={href}
              onClick={() => addViewedId(product.id)}
            >
              <h3 className="text-base md:text-lg font-normal text-gray-800 line-clamp-2 leading-snug group-hover:text-[#3483fa] transition-colors mb-1.5">
                {product.title}
              </h3>
            </Link>

            {/* Calificación con estrellas */}
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-xs">★</span>
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-700">4.9</span>
              <span className="text-xs text-gray-400">(48 reseñas)</span>
            </div>

            <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
              {product.description?.trim() || `${product.title} con garantía oficial de marca y comprobante electrónico.`}
            </p>

            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 text-xs line-through block mb-1">
                {symbol} {Number(product.originalPrice).toFixed(2)}
              </span>
            )}

            <div className="flex items-baseline gap-2 mb-2">
              <div className="flex items-start text-gray-900 font-semibold tracking-tight">
                <span className="text-sm mr-1">{symbol}</span>
                <span className="text-2xl sm:text-3xl leading-tight">{priceInt}</span>
                <span className="text-xs sm:text-sm leading-tight font-medium ml-0.5">{priceDec}</span>
              </div>
              {product.discount && product.discount > 0 ? (
                <span className="text-[#00a650] text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {product.discount}% OFF
                </span>
              ) : null}
            </div>
          </div>

          <Link
            href={href}
            onClick={() => addViewedId(product.id)}
            className="w-full text-center bg-[#3483fa] hover:bg-blue-600 text-white font-medium text-xs py-2.5 px-4 rounded-lg shadow-xs transition-colors mt-4 block"
          >
            Aprovechar oferta
          </Link>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  TbChevronLeft, 
  TbChevronRight, 
  TbAward,
  TbBuildingStore
} from 'react-icons/tb';
import { 
  SiApple, 
  SiSamsung, 
  SiNike, 
  SiAdidas, 
  SiSony, 
  SiXiaomi 
} from 'react-icons/si';
import { useBrandStore } from '@/stores/brand.store';
import { Brand } from '@/types/brand.types';

export interface FallbackBrand {
  id: string;
  name: string;
  slug?: string;
  icon?: React.ElementType;
  logoUrl?: string;
  discount?: string;
  href: string;
  badge?: string;
}

const defaultBrands: FallbackBrand[] = [
  { id: '1', name: 'Samsung', slug: 'samsung', icon: SiSamsung, discount: 'Hasta 35% OFF', href: '/brand/samsung', badge: 'Oficial' },
  { id: '2', name: 'Apple', slug: 'apple', icon: SiApple, discount: 'Hasta 18 cuotas', href: '/brand/apple', badge: 'Oficial' },
  { id: '3', name: 'Nike', slug: 'nike', icon: SiNike, discount: 'Hasta 40% OFF', href: '/brand/nike', badge: 'Oficial' },
  { id: '4', name: 'Adidas', slug: 'adidas', icon: SiAdidas, discount: 'Hasta 30% OFF', href: '/brand/adidas', badge: 'Oficial' },
  { id: '5', name: 'Sony', slug: 'sony', icon: SiSony, discount: 'Hasta 25% OFF', href: '/brand/sony', badge: 'Oficial' },
  { id: '6', name: 'Xiaomi', slug: 'xiaomi', icon: SiXiaomi, discount: 'Hasta 30% OFF', href: '/brand/xiaomi', badge: 'Oficial' },
];

export const BrandsCarousel = ({
  title = 'Las mejores marcas te esperan',
}: {
  title?: string;
}) => {
  const { brands: storeBrands, fetchBrands, isLoading } = useBrandStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Filtrar solo marcas activas de la base de datos
  const activeBrands = storeBrands.filter((b) => b.isActive !== false);

  // Si hay marcas en la base de datos, usarlas; si no, usar fallback
  const hasRealBrands = activeBrands.length > 0;

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [activeBrands]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-7">
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-light text-[#666]">{title}</h2>
          {hasRealBrands && (
            <span className="text-xs bg-gray-200/80 text-gray-600 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
              {activeBrands.length} {activeBrands.length === 1 ? 'marca' : 'marcas'}
            </span>
          )}
        </div>
        <Link href="/brands" className="text-[#3483fa] text-sm font-medium hover:text-blue-700 transition-colors">
          Ver todas las marcas
        </Link>
      </div>

      <div className="relative group/carousel">
        {/* Botón flecha izquierda */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Ver marcas anteriores"
            className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-black hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <TbChevronLeft size={22} />
          </button>
        )}

        {/* Botón flecha derecha */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Ver marcas siguientes"
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-black hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <TbChevronRight size={22} />
          </button>
        )}

        {/* Contenedor de marcas */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-none py-2 scroll-smooth"
        >
          {hasRealBrands ? (
            activeBrands.map((brand) => {
              const initials = brand.name.slice(0, 2).toUpperCase();
              const href = `/brand/${brand.slug || brand.id}`;

              return (
                <Link
                  key={brand.id}
                  href={href}
                  className="min-w-[150px] sm:min-w-[170px] md:min-w-[190px] bg-white rounded-xl p-5 border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col items-center justify-between text-center group hover:-translate-y-1 shrink-0"
                >
                  {/* Brand Logo Container */}
                  <div className="w-16 h-16 flex items-center justify-center mb-3">
                    {brand.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="max-h-14 max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 font-black text-base flex items-center justify-center group-hover:border-[#3483fa] group-hover:text-[#3483fa] transition-colors shadow-2xs">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Brand Info */}
                  <div className="w-full">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-[#3483fa] transition-colors truncate">
                      {brand.name}
                    </h3>
                    <span className="inline-block text-[11px] font-semibold text-[#00a650] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100/60">
                      Tienda Oficial
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            defaultBrands.map((brand) => {
              const Icon = brand.icon || TbAward;
              return (
                <Link
                  key={brand.id}
                  href={brand.href}
                  className="min-w-[150px] sm:min-w-[170px] md:min-w-[190px] bg-white rounded-xl p-5 border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col items-center justify-between text-center group hover:-translate-y-1 shrink-0"
                >
                  {/* Brand Logo Container */}
                  <div className="w-16 h-16 flex items-center justify-center text-gray-800 group-hover:text-black transition-colors mb-3">
                    <Icon size={40} className="transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {/* Brand Info */}
                  <div className="w-full">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-[#3483fa] transition-colors truncate">
                      {brand.name}
                    </h3>
                    <span className="inline-block text-xs font-semibold text-[#00a650] bg-emerald-50 px-2 py-0.5 rounded-full">
                      {brand.discount || 'Oficial'}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

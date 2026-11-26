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
    <section className="max-w-7xl mx-auto py-8 px-4 md:px-7">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-brand-accent mb-1">
            ETIQUETAS SELECTAS
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black leading-none">
            {title}
          </h2>
        </div>
        <Link
          href="/brands"
          className="text-xs font-bold uppercase tracking-widest text-black hover:text-brand-accent underline underline-offset-4 transition-colors shrink-0"
        >
          VER TODAS
        </Link>
      </div>

      <div className="relative group/carousel">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Ver marcas anteriores"
            className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-[#d9d9d9] hover:bg-black hover:text-white hover:border-black flex items-center justify-center text-black shadow-md transition-colors cursor-pointer rounded-none"
          >
            <TbChevronLeft size={20} />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Ver marcas siguientes"
            className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-[#d9d9d9] hover:bg-black hover:text-white hover:border-black flex items-center justify-center text-black shadow-md transition-colors cursor-pointer rounded-none"
          >
            <TbChevronRight size={20} />
          </button>
        )}

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
                  className="min-w-[155px] sm:min-w-[175px] md:min-w-[195px] bg-white rounded-none p-5 border border-[#e5e5e5] hover:border-black transition-colors duration-200 flex flex-col items-center justify-between text-center group shrink-0"
                >
                  <div className="w-16 h-16 flex items-center justify-center mb-3">
                    {brand.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="max-h-14 max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-[#f8f8f8] border border-[#e5e5e5] text-black font-display font-extrabold text-base flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-black mb-1.5 group-hover:text-brand-accent transition-colors truncate">
                      {brand.name}
                    </h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-white bg-black px-2 py-0.5">
                      Oficial
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
                  className="min-w-[155px] sm:min-w-[175px] md:min-w-[195px] bg-white rounded-none p-5 border border-[#e5e5e5] hover:border-black transition-colors duration-200 flex flex-col items-center justify-between text-center group shrink-0"
                >
                  <div className="w-16 h-16 flex items-center justify-center text-black mb-3">
                    <Icon size={36} className="transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  <div className="w-full">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-black mb-1.5 group-hover:text-brand-accent transition-colors truncate">
                      {brand.name}
                    </h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-white bg-brand-accent px-2 py-0.5">
                      {brand.discount || 'Oficial'}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

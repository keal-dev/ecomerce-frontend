'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard, Product } from './ProductCard';
import { FeaturedProductCard } from './FeaturedProductCard';
import { TbChevronLeft, TbChevronRight } from 'react-icons/tb';

interface ProductCarouselProps {
  eyebrow?: string;
  title: string;
  products: Product[];
  variant?: 'default' | 'featured';
  scrollable?: boolean;
  darkSurface?: boolean;
  headerAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export const ProductCarousel = ({
  eyebrow,
  title,
  products,
  variant = 'default',
  scrollable,
  darkSurface = false,
  headerAction,
}: ProductCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isScrollMode = scrollable !== false && variant !== 'featured';

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    if (!isScrollMode) return;
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products, isScrollMode]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!products || products.length === 0) {
    return null;
  }

  const renderAction = () => {
    if (!headerAction) return null;
    const baseCls = darkSurface
      ? 'text-xs font-bold uppercase tracking-widest text-white hover:text-brand-accent underline underline-offset-4 transition-colors cursor-pointer shrink-0'
      : 'text-xs font-bold uppercase tracking-widest text-black hover:text-brand-accent underline underline-offset-4 transition-colors cursor-pointer shrink-0';

    if (headerAction.onClick) {
      return (
        <button type="button" onClick={headerAction.onClick} className={baseCls}>
          {headerAction.label}
        </button>
      );
    }
    return (
      <Link href={headerAction.href || '#'} className={baseCls}>
        {headerAction.label}
      </Link>
    );
  };

  const renderHeader = () => (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-brand-accent mb-1">
            {eyebrow}
          </span>
        )}
        <h2
          className={`font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight leading-none ${
            darkSurface ? 'text-white' : 'text-black'
          }`}
        >
          {title}
        </h2>
      </div>
      {renderAction()}
    </div>
  );

  if (variant === 'featured' && products.length > 0) {
    const featuredProduct = products[0];
    const sideProducts = products.slice(1, 4);

    return (
      <section className="max-w-7xl mx-auto py-8 px-4 md:px-7">
        {renderHeader()}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <FeaturedProductCard product={featuredProduct} />
          {sideProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto py-8 px-4 md:px-7">
      {renderHeader()}

      {isScrollMode ? (
        <div className="relative group/carousel">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Ver productos anteriores"
              className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-[#d9d9d9] hover:bg-black hover:text-white hover:border-black flex items-center justify-center text-black shadow-md transition-colors cursor-pointer rounded-none"
            >
              <TbChevronLeft size={20} />
            </button>
          )}

          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Ver productos siguientes"
              className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-[#d9d9d9] hover:bg-black hover:text-white hover:border-black flex items-center justify-center text-black shadow-md transition-colors cursor-pointer rounded-none"
            >
              <TbChevronRight size={20} />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[180px] sm:w-[215px] md:w-[232px] shrink-0 flex flex-col"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

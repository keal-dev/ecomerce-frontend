'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProductCard, Product } from './ProductCard';
import { FeaturedProductCard } from './FeaturedProductCard';
import { TbChevronLeft, TbChevronRight } from 'react-icons/tb';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  variant?: 'default' | 'featured';
  scrollable?: boolean;
  headerAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export const ProductCarousel = ({ 
  title, 
  products, 
  variant = 'default',
  scrollable,
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
    if (headerAction.onClick) {
      return (
        <button
          type="button"
          onClick={headerAction.onClick}
          className="text-[#3483fa] text-sm font-medium hover:text-blue-700 cursor-pointer"
        >
          {headerAction.label}
        </button>
      );
    }
    return (
      <a 
        href={headerAction.href || '#'} 
        className="text-[#3483fa] text-sm font-medium hover:text-blue-700"
      >
        {headerAction.label}
      </a>
    );
  };

  if (variant === 'featured' && products.length > 0) {
    const featuredProduct = products[0];
    const sideProducts = products.slice(1, 4);

    return (
      <div className="max-w-7xl mx-auto py-6 px-4 md:px-7">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-light text-[#666]">{title}</h2>
          {renderAction()}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <FeaturedProductCard product={featuredProduct} />
          {sideProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 md:px-7">
      <div className="flex items-end justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-light text-[#666]">{title}</h2>
          {products.length > 5 && (
            <span className="text-[11px] bg-gray-200/80 text-gray-600 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
              {products.length} productos
            </span>
          )}
        </div>
        {renderAction()}
      </div>

      {isScrollMode ? (
        <div className="relative group/carousel">
          {/* Botón flecha izquierda */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Ver productos anteriores"
              className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-black hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <TbChevronLeft size={20} />
            </button>
          )}

          {/* Botón flecha derecha */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Ver productos siguientes"
              className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-black hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <TbChevronRight size={20} />
            </button>
          )}

          {/* Contenedor desplazable menos ancho y más estilizado */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex gap-3.5 overflow-x-auto scrollbar-none scroll-smooth pb-3 pt-1 px-1 -mx-1"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[165px] sm:w-[180px] md:w-[192px] shrink-0 flex flex-col"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

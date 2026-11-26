'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  TbDeviceMobile, 
  TbDeviceLaptop, 
  TbDeviceGamepad2, 
  TbDeviceTv, 
  TbShirt, 
  TbShoe, 
  TbArmchair, 
  TbToolsKitchen2, 
  TbCar, 
  TbBarbell, 
  TbHorseToy, 
  TbShoppingCart,
  TbTools,
  TbCategory,
  TbChevronLeft,
  TbChevronRight
} from 'react-icons/tb';
import { useCategoryStore } from '@/stores/category.store';
import { Category } from '@/types/category.types';

const iconMap: Record<string, React.ElementType> = {
  TbDeviceMobile,
  TbDeviceLaptop,
  TbDeviceGamepad2,
  TbDeviceTv,
  TbShirt,
  TbShoe,
  TbArmchair,
  TbToolsKitchen2,
  TbCar,
  TbBarbell,
  TbHorseToy,
  TbShoppingCart,
  TbTools,
  TbCategory
};

// Fallback de categorías de cooperativa gourmet si aún no hay registradas en la BD
const defaultFallbackCategories: Category[] = [
  { id: '1', name: 'Vinos', href: '/search?q=vino', icon: 'TbCategory' },
  { id: '2', name: 'Chocolates', href: '/search?q=chocolate', icon: 'TbCategory' },
  { id: '3', name: 'Cacao', href: '/search?q=cacao', icon: 'TbCategory' },
  { id: '4', name: 'Café de Origen', href: '/search?q=cafe', icon: 'TbCategory' },
  { id: '5', name: 'Derivados del Cacao', href: '/search?q=derivados', icon: 'TbCategory' },
  { id: '6', name: 'Nibs y Pasta', href: '/search?q=pasta', icon: 'TbCategory' },
  { id: '7', name: 'Packs de Regalo', href: '/search?q=pack', icon: 'TbCategory' },
  { id: '8', name: 'Edición Limitada', href: '/search?q=especial', icon: 'TbCategory', badge: 'Top' },
];

interface CategoryCarouselProps {
  title?: string;
  categories?: Category[];
}

export const CategoryCarousel = ({
  title = 'EXPLORA POR CATEGORÍA',
  categories: propCategories,
}: CategoryCarouselProps) => {
  const { categories: storeCategories, isLoading, fetchCategories } = useCategoryStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Si se pasaron categorías por prop, usarlas; sino usar las del store del backend; si está vacío, usar fallback
  const categoriesToRender = (propCategories && propCategories.length > 0)
    ? propCategories
    : (storeCategories.length > 0 ? storeCategories : defaultFallbackCategories);

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
  }, [categoriesToRender]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section className="max-w-7xl mx-auto py-8 px-4 md:px-7">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-brand-accent mb-1">
            NUESTRA COOPERATIVA
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black leading-none">
            {title}
          </h2>
        </div>
        <Link
          href="/categories"
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
            aria-label="Ver categorías anteriores"
            className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-[#d9d9d9] hover:bg-black hover:text-white hover:border-black flex items-center justify-center text-black shadow-md transition-colors cursor-pointer rounded-none"
          >
            <TbChevronLeft size={20} />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Ver categorías siguientes"
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
          {isLoading && storeCategories.length === 0 ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="w-[155px] sm:w-[175px] md:w-[190px] shrink-0 bg-white rounded-none p-5 border border-[#e5e5e5] flex flex-col items-center justify-center text-center animate-pulse"
              >
                <div className="w-16 h-16 bg-neutral-100 mb-3" />
                <div className="h-3.5 bg-neutral-200 w-3/4 mb-1" />
              </div>
            ))
          ) : (
            categoriesToRender.map((cat) => {
              const isImage = Boolean(
                cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('data:') || cat.icon.startsWith('/'))
              );
              const IconComponent = (cat.icon && iconMap[cat.icon]) ? iconMap[cat.icon] : TbCategory;
              const linkHref = cat.href || `/category/${cat.id}`;

              return (
                <Link
                  key={cat.id}
                  href={linkHref}
                  className="group w-[155px] sm:w-[175px] md:w-[190px] shrink-0 bg-white rounded-none p-5 border border-[#e5e5e5] hover:border-black transition-colors duration-200 flex flex-col items-center justify-center text-center relative overflow-hidden select-none"
                >
                  {cat.badge && (
                    <span className="absolute top-2 right-2 bg-brand-accent text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-none uppercase tracking-wider">
                      {cat.badge}
                    </span>
                  )}

                  <div className="w-16 h-16 bg-[#f8f8f8] group-hover:bg-black text-black group-hover:text-white flex items-center justify-center mb-3 transition-colors duration-200 overflow-hidden p-2.5">
                    {isImage ? (
                      <img
                        src={cat.icon}
                        alt={cat.name}
                        className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <IconComponent
                        size={28}
                        className="transition-transform duration-200 group-hover:scale-110 shrink-0"
                      />
                    )}
                  </div>

                  <span className="text-xs font-extrabold uppercase tracking-wider text-black group-hover:text-brand-accent transition-colors line-clamp-1 w-full text-center">
                    {cat.name}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

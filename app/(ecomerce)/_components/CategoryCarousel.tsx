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

// Fallback por defecto si aún no hay categorías registradas en la base de datos
const defaultFallbackCategories: Category[] = [
  { id: '1', name: 'Celulares', href: '#', icon: 'TbDeviceMobile' },
  { id: '2', name: 'Computación', href: '#', icon: 'TbDeviceLaptop' },
  { id: '3', name: 'Consolas y Juegos', href: '#', icon: 'TbDeviceGamepad2' },
  { id: '4', name: 'Televisores y Audio', href: '#', icon: 'TbDeviceTv' },
  { id: '5', name: 'Ropa y Moda', href: '#', icon: 'TbShirt' },
  { id: '6', name: 'Calzado', href: '#', icon: 'TbShoe' },
  { id: '7', name: 'Hogar y Muebles', href: '#', icon: 'TbArmchair' },
  { id: '8', name: 'Electrodomésticos', href: '#', icon: 'TbToolsKitchen2' },
  { id: '9', name: 'Accesorios Vehículos', href: '#', icon: 'TbCar' },
  { id: '10', name: 'Deportes y Fitness', href: '#', icon: 'TbBarbell' },
  { id: '11', name: 'Juguetes', href: '#', icon: 'TbHorseToy' },
  { id: '12', name: 'Supermercado', href: '#', icon: 'TbShoppingCart', badge: 'Envío Gratis' },
];

interface CategoryCarouselProps {
  title?: string;
  categories?: Category[];
}

export const CategoryCarousel = ({ 
  title = "Categorías destacadas", 
  categories: propCategories 
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
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-7">
      <div className="flex items-end justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-light text-[#666]">{title}</h2>
          {storeCategories.length > 0 && (
            <span className="text-xs bg-gray-200/80 text-gray-600 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
              {storeCategories.length} {storeCategories.length === 1 ? 'categoría' : 'categorías'}
            </span>
          )}
        </div>
        <Link href="/categories" className="text-[#3483fa] text-sm font-medium hover:text-blue-700 transition-colors">
          Ver todas las categorías
        </Link>
      </div>

      <div className="relative group/carousel">
        {/* Botón flecha izquierda */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Ver categorías anteriores"
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
            aria-label="Ver categorías siguientes"
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-black hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <TbChevronRight size={22} />
          </button>
        )}

        {/* Contenedor desplazable de categorías */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-3.5 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1 px-1 -mx-1"
        >
          {isLoading && storeCategories.length === 0 ? (
            // Skeleton Loader mientras carga del backend
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="w-[145px] sm:w-[165px] md:w-[185px] shrink-0 bg-white rounded-lg p-4 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center animate-pulse"
              >
                <div className="w-14 h-14 rounded-full bg-gray-200 mb-3" />
                <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-1" />
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
                  className="group w-[145px] sm:w-[165px] md:w-[185px] shrink-0 bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center relative overflow-hidden hover:-translate-y-1 select-none"
                >
                  {cat.badge && (
                    <span className="absolute top-2 right-2 bg-[#00a650] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      {cat.badge}
                    </span>
                  )}

                  <div className="w-14 h-14 rounded-full bg-gray-50 group-hover:bg-[#ffe600]/25 text-[#333] group-hover:text-black flex items-center justify-center mb-3 transition-colors duration-200 overflow-hidden p-2.5">
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
                        className="transition-transform duration-200 group-hover:scale-110 text-gray-700 group-hover:text-black shrink-0" 
                      />
                    )}
                  </div>

                  <span className="text-[13px] font-medium text-gray-700 group-hover:text-[#3483fa] transition-colors line-clamp-1 w-full text-center">
                    {cat.name}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

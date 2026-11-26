'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  TbChevronDown, 
  TbChevronRight, 
  TbDeviceLaptop, 
  TbToolsKitchen2, 
  TbArmchair, 
  TbShirt, 
  TbShoe,
  TbBarbell, 
  TbTools, 
  TbCar, 
  TbShoppingCart, 
  TbHorseToy,
  TbDeviceMobile,
  TbDeviceGamepad2,
  TbDeviceTv,
  TbCategory,
  TbBottle,
  TbCandy,
  TbSeedling,
  TbCoffee
} from 'react-icons/tb';
import { Category } from '@/types/category.types';
import { useCategoryStore } from '@/stores/category.store';

// Mapeo de íconos según el campo icon de la entidad Category
const iconMap: Record<string, React.ElementType> = {
  TbDeviceLaptop,
  TbToolsKitchen2,
  TbArmchair,
  TbShirt,
  TbShoe,
  TbBarbell,
  TbTools,
  TbCar,
  TbShoppingCart,
  TbHorseToy,
  TbDeviceMobile,
  TbDeviceGamepad2,
  TbDeviceTv,
  TbCategory,
  TbBottle,
  TbCandy,
  TbSeedling,
  TbCoffee
};

interface CategoriesDropdownProps {
  categories?: Category[];
  isActive?: boolean;
}

export const CategoriesDropdown = ({ categories: propCategories, isActive = false }: CategoriesDropdownProps) => {
  const { categories: storeCategories, isLoading, fetchCategories } = useCategoryStore();
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Carga las categorías directamente desde el backend a través de Zustand
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Las categorías provienen exclusivamente del backend (o prop si se pasa explícitamente)
  const categories = propCategories || storeCategories;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(prev => !prev);
  };

  // Cierra el menú al hacer clic afuera o presionar ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Botón trigger en la barra de navegación */}
      <button
        type="button"
        onClick={handleToggleClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-1.5 cursor-pointer transition-colors text-[11px] font-bold uppercase tracking-wider outline-none ${
          isOpen || isActive ? 'text-brand-accent' : 'text-white hover:text-brand-accent'
        }`}
      >
        <span>CATEGORÍAS</span>
        <TbChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-accent' : isActive ? 'text-brand-accent' : ''}`} 
        />
      </button>

      {/* Menú Desplegable Glamour de Colecciones */}
      {isOpen && (
        <div 
          className="absolute left-0 top-full pt-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ width: categories.length > 4 ? '560px' : '340px' }}
        >
          <div className="bg-white text-[#020202] rounded-none shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)] border-t-2 border-brand-accent overflow-hidden">
            {/* Encabezado editorial */}
            <div className="px-7 pt-6 pb-4 text-center border-b border-[#ececec]">
              <span className="block text-[10px] font-bold uppercase tracking-[0.32em] text-brand-accent">
                Nuestras colecciones
              </span>
              <span className="block mt-1.5 font-display text-xl font-bold tracking-wide text-black">
                Explora por Categoría
              </span>
              <span className="mx-auto mt-3 block h-px w-10 bg-brand-accent" />
            </div>

            {/* Estado de carga / vacío / lista */}
            {isLoading && categories.length === 0 ? (
              <div className="py-10 px-4 flex flex-col items-center justify-center space-y-2 text-xs text-neutral-500">
                <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
                <span>Cargando colecciones...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-10 px-4 text-center text-xs text-neutral-500">
                No hay categorías disponibles
              </div>
            ) : (
              <ul
                className={`grid max-h-[420px] overflow-y-auto px-4 py-4 gap-x-2 gap-y-1 ${
                  categories.length > 4 ? 'grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {categories.map((cat) => {
                  const IconComponent = (cat.icon && iconMap[cat.icon]) ? iconMap[cat.icon] : TbCategory;

                  return (
                    <li key={cat.id}>
                      <Link
                        href={cat.href || `/category/${cat.id}`}
                        onClick={() => setIsOpen(false)}
                        className="group flex items-center gap-3.5 px-3 py-3 border border-transparent hover:border-[#e5e5e5] hover:bg-[#faf8f5] transition-all duration-200 cursor-pointer"
                      >
                        <span className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-black group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-colors duration-200">
                          {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('data:')) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cat.icon}
                              alt={cat.name}
                              className="w-5 h-5 object-contain"
                            />
                          ) : (
                            <IconComponent size={19} strokeWidth={1.6} />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-[15px] font-semibold tracking-wide text-black group-hover:text-brand-accent transition-colors">
                            {cat.name}
                          </span>
                          {cat.badge && (
                            <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500">
                              {cat.badge}
                            </span>
                          )}
                        </span>

                        <TbChevronRight
                          size={14}
                          className="shrink-0 text-neutral-300 group-hover:text-brand-accent group-hover:translate-x-0.5 transition-all"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Pie del menú */}
            <div className="px-7 py-3.5 bg-brand-primary text-center">
              <Link
                href="/categories"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white hover:text-brand-accent transition-colors"
              >
                <span>Ver todo el catálogo</span>
                <TbChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

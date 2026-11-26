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
  TbCategory
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
  TbCategory
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
          isOpen || isActive ? 'text-[#de2a2a]' : 'text-white hover:text-[#de2a2a]'
        }`}
      >
        <span>CATEGORÍAS</span>
        <TbChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#de2a2a]' : isActive ? 'text-[#de2a2a]' : ''}`} 
        />
      </button>

      {/* Menú Desplegable Directo de Categorías */}
      {isOpen && (
        <div 
          className="absolute left-0 top-full pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
          style={{ width: '280px' }}
        >
          {/* Tarjeta flotante negra editorial */}
          <div className="bg-black text-white rounded-none shadow-2xl overflow-hidden border border-[#262626] py-2">
            
            {/* Estado de carga */}
            {isLoading && categories.length === 0 ? (
              <div className="py-6 px-4 flex flex-col items-center justify-center space-y-2 text-xs text-neutral-400">
                <div className="w-5 h-5 border-2 border-[#de2a2a] border-t-transparent rounded-full animate-spin" />
                <span>Cargando categorías...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-6 px-4 text-center text-xs text-neutral-400">
                No hay categorías disponibles
              </div>
            ) : (
              <ul className="flex flex-col max-h-[460px] overflow-y-auto divide-y divide-[#1f1f1f]">
                {categories.map((cat) => {
                  const IconComponent = (cat.icon && iconMap[cat.icon]) ? iconMap[cat.icon] : TbCategory;

                  return (
                    <li key={cat.id}>
                      <Link
                        href={cat.href || `/category/${cat.id}`}
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2.5 flex items-center justify-between text-xs text-neutral-200 hover:bg-[#de2a2a] hover:text-white transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 truncate">
                          {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('data:')) ? (
                            <img 
                              src={cat.icon} 
                              alt={cat.name} 
                              className="w-[18px] h-[18px] object-contain shrink-0" 
                            />
                          ) : (
                            <IconComponent 
                              size={18} 
                              className="text-neutral-400 group-hover:text-white transition-colors shrink-0" 
                            />
                          )}
                          <span className="truncate font-semibold uppercase tracking-wide">{cat.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {cat.badge && (
                            <span className="bg-[#f3ff34] text-black text-[9px] font-extrabold px-1.5 py-0.5 uppercase tracking-wider">
                              {cat.badge}
                            </span>
                          )}
                          <TbChevronRight 
                            size={14} 
                            className="text-neutral-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" 
                          />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Pie del menú */}
            <div className="px-4 pt-2.5 pb-1 border-t border-[#262626] mt-1">
              <Link
                href="/categories"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold uppercase tracking-wider text-white hover:text-[#de2a2a] block text-center py-1 transition-colors"
              >
                Ver todas las categorías →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

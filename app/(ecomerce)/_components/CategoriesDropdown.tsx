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
}

export const CategoriesDropdown = ({ categories: propCategories }: CategoriesDropdownProps) => {
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
        className={`flex items-center gap-1 cursor-pointer transition-colors text-[13px] font-normal outline-none ${
          isOpen ? 'text-[#3483fa] font-medium' : 'text-[#333] hover:text-[#3483fa]'
        }`}
      >
        <span>Categorías</span>
        <TbChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#3483fa]' : ''}`} 
        />
      </button>

      {/* Menú Desplegable Directo de Categorías */}
      {isOpen && (
        <div 
          className="absolute left-0 top-full pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
          style={{ width: '280px' }}
        >
          {/* Flecha superior indicadora */}
          <div className="absolute top-[3px] left-6 w-0 h-0 border-x-[6px] border-x-transparent border-b-[6px] border-b-[#333333]" />

          {/* Tarjeta flotante oscura */}
          <div className="bg-[#333333] text-white rounded-md shadow-2xl overflow-hidden border border-neutral-700/60 py-2">
            
            {/* Estado de carga */}
            {isLoading && categories.length === 0 ? (
              <div className="py-6 px-4 flex flex-col items-center justify-center space-y-2 text-xs text-gray-400">
                <div className="w-5 h-5 border-2 border-[#3483fa] border-t-transparent rounded-full animate-spin" />
                <span>Cargando categorías...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-6 px-4 text-center text-xs text-gray-400">
                No hay categorías disponibles
              </div>
            ) : (
              <ul className="flex flex-col max-h-[460px] overflow-y-auto divide-y divide-neutral-800/60">
                {categories.map((cat) => {
                  const IconComponent = (cat.icon && iconMap[cat.icon]) ? iconMap[cat.icon] : TbCategory;

                  return (
                    <li key={cat.id}>
                      <Link
                        href={cat.href || `/category/${cat.id}`}
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2.5 flex items-center justify-between text-[13px] text-gray-200 hover:bg-[#3483fa] hover:text-white transition-colors cursor-pointer group"
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
                              className="text-gray-400 group-hover:text-white transition-colors shrink-0" 
                            />
                          )}
                          <span className="truncate group-hover:font-medium">{cat.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {cat.badge && (
                            <span className="bg-[#00a650] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              {cat.badge}
                            </span>
                          )}
                          <TbChevronRight 
                            size={14} 
                            className="text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" 
                          />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Pie del menú */}
            <div className="px-4 pt-2.5 pb-1 border-t border-neutral-700/60 mt-1">
              <Link
                href="/categories"
                onClick={() => setIsOpen(false)}
                className="text-xs text-[#3483fa] hover:text-blue-400 hover:underline block text-center font-medium py-1"
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

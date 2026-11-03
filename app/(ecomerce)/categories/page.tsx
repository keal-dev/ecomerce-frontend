'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  TbSearch, 
  TbCategory, 
  TbChevronRight,
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
  TbTools
} from 'react-icons/tb';
import { useCategoryStore } from '@/stores/category.store';

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

export default function AllCategoriesPage() {
  const { categories, isLoading, fetchCategories } = useCategoryStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase().trim();
    return categories.filter(c => 
      c.name.toLowerCase().includes(term) || 
      (c.badge && c.badge.toLowerCase().includes(term))
    );
  }, [categories, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-7 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#3483fa] transition-colors">
          Inicio
        </Link>
        <TbChevronRight size={12} />
        <span className="text-gray-800 font-medium">Categorías</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-light text-[#333]">Todas las Categorías</h1>
          <p className="text-sm text-gray-500 mt-1">
            Explora todos los departamentos y productos disponibles en nuestra tienda.
          </p>
        </div>

        {/* Buscador de categorías */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar departamento..."
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3483fa] shadow-xs transition-colors"
          />
          <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
        </div>
      </div>

      {/* Grid de Categorías */}
      {isLoading && categories.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center animate-pulse"
            >
              <div className="w-16 h-16 rounded-full bg-gray-200 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-xs max-w-lg mx-auto">
          <TbCategory size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700">No se encontraron categorías</h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm 
              ? `No hay resultados para "${searchTerm}". Intenta con otro término.` 
              : 'Aún no se han configurado categorías en la tienda.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-xs font-semibold text-[#3483fa] hover:underline"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredCategories.map((cat) => {
            const isImage = Boolean(
              cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('data:') || cat.icon.startsWith('/'))
            );
            const IconComponent = (cat.icon && iconMap[cat.icon]) ? iconMap[cat.icon] : TbCategory;
            const linkHref = cat.href || `/category/${cat.id}`;

            return (
              <Link
                key={cat.id}
                href={linkHref}
                className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center relative overflow-hidden hover:-translate-y-1"
              >
                {cat.badge && (
                  <span className="absolute top-2.5 right-2.5 bg-[#00a650] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    {cat.badge}
                  </span>
                )}

                <div className="w-16 h-16 rounded-full bg-gray-50 group-hover:bg-[#ffe600]/25 text-[#333] group-hover:text-black flex items-center justify-center mb-3 transition-colors duration-200 p-3">
                  {isImage ? (
                    <img
                      src={cat.icon}
                      alt={cat.name}
                      className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <IconComponent 
                      size={32} 
                      className="transition-transform duration-200 group-hover:scale-110 text-gray-700 group-hover:text-black shrink-0" 
                    />
                  )}
                </div>

                <span className="text-sm font-medium text-gray-800 group-hover:text-[#3483fa] transition-colors line-clamp-2 w-full text-center">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

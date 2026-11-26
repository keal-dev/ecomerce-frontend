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
  TbTools,
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
  TbCategory,
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
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.badge && c.badge.toLowerCase().includes(term)),
    );
  }, [categories, searchTerm]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-7 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-neutral-500 mb-6">
          <Link href="/" className="hover:text-[#de2a2a] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={12} />
          <span className="text-black font-bold">Categorías</span>
        </nav>

        {/* Header Editorial */}
        <div className="bg-black text-white border-b-4 border-[#de2a2a] p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#de2a2a] block mb-1.5">
              Explora nuestra cooperativa
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              Todas las Categorías
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1.5">
              Vinos seleccionados, chocolates finos, derivados del cacao, café de origen y packs para delivery.
            </p>
          </div>

          {/* Buscador de categorías */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full bg-white border border-[#262626] rounded-none pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#020202] placeholder:text-neutral-500 focus:outline-none"
            />
            <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={17} />
          </div>
        </div>

        {/* Grid de Categorías */}
        {isLoading && categories.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="bg-[#f8f8f8] rounded-none p-5 border border-[#d9d9d9] flex flex-col items-center justify-center text-center animate-pulse"
              >
                <div className="w-16 h-16 bg-neutral-200 mb-3" />
                <div className="h-4 bg-neutral-200 w-3/4 mb-1" />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-[#f8f8f8] rounded-none p-12 text-center border border-[#d9d9d9] max-w-lg mx-auto">
            <TbCategory size={48} className="text-neutral-400 mx-auto mb-3" />
            <h3 className="font-display text-lg font-extrabold uppercase text-black">
              No se encontraron categorías
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              {searchTerm
                ? `No hay resultados para "${searchTerm}". Intenta con otro término.`
                : 'Aún no se han configurado categorías en la tienda.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-4 px-5 py-2 bg-[#de2a2a] text-white text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredCategories.map((cat) => {
              const isImage = Boolean(
                cat.icon &&
                  (cat.icon.startsWith('http') || cat.icon.startsWith('data:') || cat.icon.startsWith('/')),
              );
              const IconComponent = cat.icon && iconMap[cat.icon] ? iconMap[cat.icon] : TbCategory;
              const linkHref = cat.href || `/category/${cat.id}`;

              return (
                <Link
                  key={cat.id}
                  href={linkHref}
                  className="group bg-white rounded-none p-5 border border-[#d9d9d9] hover:border-black transition-all duration-200 flex flex-col items-center justify-center text-center relative overflow-hidden"
                >
                  {cat.badge && (
                    <span className="absolute top-2 right-2 bg-[#de2a2a] text-white text-[9px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider">
                      {cat.badge}
                    </span>
                  )}

                  <div className="w-16 h-16 rounded-none bg-[#f8f8f8] border border-[#d9d9d9] group-hover:bg-black group-hover:border-black group-hover:text-white text-black flex items-center justify-center mb-3 transition-colors duration-200 p-3">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cat.icon}
                        alt={cat.name}
                        className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <IconComponent
                        size={30}
                        className="transition-transform duration-200 group-hover:scale-110 shrink-0"
                      />
                    )}
                  </div>

                  <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-tight text-black group-hover:text-[#de2a2a] transition-colors line-clamp-2 w-full text-center">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

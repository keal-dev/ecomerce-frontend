'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  TbSearch, 
  TbAward, 
  TbChevronRight,
  TbBuildingStore,
  TbArrowLeft,
} from 'react-icons/tb';
import { useBrandStore } from '@/stores/brand.store';

export default function AllBrandsPage() {
  const { brands, isLoading, fetchBrands } = useBrandStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const activeBrands = useMemo(() => {
    return brands.filter((b) => b.isActive !== false);
  }, [brands]);

  const filteredBrands = useMemo(() => {
    if (!searchTerm.trim()) return activeBrands;
    const term = searchTerm.toLowerCase().trim();
    return activeBrands.filter((b) => 
      b.name.toLowerCase().includes(term) ||
      (b.description && b.description.toLowerCase().includes(term))
    );
  }, [activeBrands, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-7 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#3483fa] transition-colors">
          Inicio
        </Link>
        <TbChevronRight size={12} />
        <span className="text-gray-800 font-medium">Marcas Oficiales</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-light text-[#333]">Tiendas y Marcas Oficiales</h1>
          <p className="text-sm text-gray-500 mt-1">
            Encuentra productos garantizados de tus marcas y fabricantes favoritos.
          </p>
        </div>

        {/* Buscador de marcas */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar marca..."
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3483fa] shadow-2xs transition-colors"
          />
          <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
        </div>
      </div>

      {/* Grid de Marcas */}
      {isLoading && activeBrands.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center animate-pulse"
            >
              <div className="w-16 h-16 rounded-full bg-gray-200 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
            </div>
          ))}
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-xs max-w-lg mx-auto">
          <TbAward size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700">No se encontraron marcas</h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm 
              ? `No hay resultados para "${searchTerm}". Intenta con otro término.` 
              : 'Aún no se han configurado marcas en la tienda.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-xs font-semibold text-[#3483fa] hover:underline cursor-pointer"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredBrands.map((brand) => {
            const initials = brand.name.slice(0, 2).toUpperCase();
            const linkHref = `/brand/${brand.slug || brand.id}`;

            return (
              <Link
                key={brand.id}
                href={linkHref}
                className="group bg-white rounded-xl p-5 border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col items-center justify-between text-center relative overflow-hidden hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-50 group-hover:bg-[#ffe600]/20 flex items-center justify-center mb-3 transition-colors duration-200 p-2">
                  {brand.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="max-h-12 max-w-full object-contain transition-transform duration-200 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-black text-gray-800 text-lg group-hover:text-[#3483fa] transition-colors">
                      {initials}
                    </span>
                  )}
                </div>

                <div className="w-full">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-[#3483fa] transition-colors line-clamp-1 block">
                    {brand.name}
                  </span>
                  <span className="inline-block text-[10.5px] font-semibold text-[#00a650] bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                    Tienda Oficial
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

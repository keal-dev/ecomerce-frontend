'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TbSearch,
  TbAward,
  TbChevronRight,
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
    return activeBrands.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        (b.description && b.description.toLowerCase().includes(term)),
    );
  }, [activeBrands, searchTerm]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-7 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-neutral-500 mb-6">
          <Link href="/" className="hover:text-brand-accent transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={12} />
          <span className="text-black font-bold">Productores & Marcas</span>
        </nav>

        {/* Header */}
        <div className="bg-black text-white border-b-4 border-brand-accent p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-accent block mb-1.5">
              Calidad de origen garantizada
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              Productores & Marcas Oficiales
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1.5">
              Encuentra vinos, chocolates, derivados del cacao y café de nuestras líneas y marcas asociadas.
            </p>
          </div>

          {/* Buscador de marcas */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar marca o productor..."
              className="w-full bg-white border border-[#262626] rounded-none pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#020202] placeholder:text-neutral-500 focus:outline-none"
            />
            <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={17} />
          </div>
        </div>

        {/* Grid de Marcas */}
        {isLoading && activeBrands.length === 0 ? (
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
        ) : filteredBrands.length === 0 ? (
          <div className="bg-[#f8f8f8] rounded-none p-12 text-center border border-[#d9d9d9] max-w-lg mx-auto">
            <TbAward size={48} className="text-neutral-400 mx-auto mb-3" />
            <h3 className="font-display text-lg font-extrabold uppercase text-black">
              No se encontraron marcas
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              {searchTerm
                ? `No hay resultados para "${searchTerm}". Intenta con otro término.`
                : 'Aún no se han configurado marcas en la tienda.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-4 px-5 py-2 bg-brand-accent text-white text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer"
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
                  className="group bg-white rounded-none p-5 border border-[#d9d9d9] hover:border-black transition-all duration-200 flex flex-col items-center justify-between text-center relative overflow-hidden"
                >
                  <div className="w-16 h-16 rounded-none bg-[#f8f8f8] border border-[#d9d9d9] group-hover:border-black flex items-center justify-center mb-3 transition-colors duration-200 p-2">
                    {brand.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="max-h-12 max-w-full object-contain transition-transform duration-200 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <span className="font-display font-black text-black text-lg group-hover:text-brand-accent transition-colors">
                        {initials}
                      </span>
                    )}
                  </div>

                  <div className="w-full">
                    <span className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-tight text-black group-hover:text-brand-accent transition-colors line-clamp-1 block">
                      {brand.name}
                    </span>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#2e9e7b] bg-[#2e9e7b]/10 px-2 py-0.5 rounded-none mt-1.5">
                      Marca Oficial
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

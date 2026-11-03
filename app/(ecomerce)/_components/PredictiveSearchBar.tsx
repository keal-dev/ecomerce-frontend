'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TbSearch,
  TbX,
  TbClock,
  TbArrowRight,
  TbLoader2,
  TbArrowLeft,
  TbTag,
} from 'react-icons/tb';
import { FaBolt } from 'react-icons/fa6';
import { useSearchHistoryStore } from '@/stores/search-history.store';
import { useCompanyStore } from '@/stores/company.store';
import { getProducts } from '@/services/product.service';
import { Product } from '@/types/product.types';

interface PredictiveSearchBarProps {
  isMobileModal?: boolean;
  onCloseMobile?: () => void;
}

export const PredictiveSearchBar = ({
  isMobileModal = false,
  onCloseMobile,
}: PredictiveSearchBarProps) => {
  const router = useRouter();
  const { company } = useCompanyStore();
  const symbol = company?.currencySymbol || 'S/';

  const { recentQueries, addQuery, removeQuery, clearQueries } = useSearchHistoryStore();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar desplegable si se hace clic afuera (en escritorio)
  useEffect(() => {
    if (isMobileModal) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileModal]);

  // Tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        if (isMobileModal && onCloseMobile) {
          onCloseMobile();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileModal, onCloseMobile]);

  // Búsqueda en vivo con Debounce (250ms)
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await getProducts({ search: trimmed, isActive: true });
        setSuggestions(results.slice(0, 5));
      } catch (err) {
        console.error('Error al autocompletar búsqueda:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Ejecutar búsqueda completa hacia /search?q=...
  const handleExecuteSearch = (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean) return;

    addQuery(clean);
    setIsOpen(false);
    if (isMobileModal && onCloseMobile) {
      onCloseMobile();
    }
    router.push(`/search?q=${encodeURIComponent(clean)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteSearch(query);
  };

  const handleSelectProduct = (product: Product) => {
    addQuery(product.title);
    setIsOpen(false);
    if (isMobileModal && onCloseMobile) {
      onCloseMobile();
    }
  };

  const hasRecent = recentQueries.length > 0;
  const showRecent = isOpen && query.trim().length < 2 && hasRecent;
  const showSuggestions = isOpen && query.trim().length >= 2;

  // Renderizado para Modal Móvil
  if (isMobileModal) {
    return (
      <div className="flex flex-col h-full w-full">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2.5 bg-[#fff059] border-b border-yellow-400">
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 text-gray-800 hover:bg-black/5 rounded-full cursor-pointer"
            aria-label="Cerrar búsqueda"
          >
            <TbArrowLeft size={22} />
          </button>

          <div className="flex-1 relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos, marcas y más..."
              className="w-full bg-white py-2 pl-3.5 pr-8 rounded-full shadow-xs border-none outline-none text-xs text-[#333] placeholder:text-gray-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 text-gray-400 hover:text-black p-0.5"
              >
                <TbX size={16} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-3 py-1.5 bg-[#3483fa] text-white text-xs font-semibold rounded-full hover:bg-[#2968c8] cursor-pointer"
          >
            Buscar
          </button>
        </form>

        {/* Contenido desplegable en móvil */}
        <div className="flex-1 overflow-y-auto bg-white p-3 divide-y divide-gray-100">
          {/* Búsquedas recientes en móvil */}
          {query.trim().length < 2 && hasRecent && (
            <div className="py-2">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Búsquedas recientes
                </span>
                <button
                  type="button"
                  onClick={clearQueries}
                  className="text-[11px] text-gray-400 hover:text-rose-600 cursor-pointer"
                >
                  Borrar historial
                </button>
              </div>
              <div className="space-y-1">
                {recentQueries.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between px-2.5 py-2 hover:bg-gray-50 rounded-lg group"
                  >
                    <button
                      type="button"
                      onClick={() => handleExecuteSearch(item)}
                      className="flex items-center gap-2.5 text-xs text-gray-700 font-medium text-left flex-1"
                    >
                      <TbClock size={16} className="text-gray-400" />
                      <span>{item}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuery(item);
                      }}
                      className="text-gray-300 hover:text-gray-600 p-1"
                    >
                      <TbX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias de productos en móvil */}
          {query.trim().length >= 2 && (
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-xs text-gray-500">
                  <TbLoader2 className="animate-spin text-[#3483fa]" size={20} />
                  <span>Buscando publicaciones...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-1 py-1">
                  {suggestions.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug || p.id}`}
                      onClick={() => handleSelectProduct(p)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-50 p-1 flex items-center justify-center shrink-0 border border-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl || '/placeholder.png'}
                          alt={p.title}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 line-clamp-1">
                          {p.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-gray-900">
                            {symbol} {Number(p.price).toFixed(2)}
                          </span>
                          {p.discount && Number(p.discount) > 0 && (
                            <span className="text-[10px] font-bold text-[#00a650] bg-emerald-50 px-1 rounded">
                              {p.discount}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleExecuteSearch(query)}
                    className="w-full mt-3 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#3483fa] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Ver todos los resultados para &quot;{query}&quot;</span>
                    <TbArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-gray-500">
                  <p>No hay coincidencias rápidas para &quot;{query}&quot;</p>
                  <button
                    type="button"
                    onClick={() => handleExecuteSearch(query)}
                    className="mt-2 text-[#3483fa] font-semibold underline"
                  >
                    Buscar de todos modos
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Renderizado para Escritorio (Navbar)
  return (
    <div ref={containerRef} className="relative w-full max-w-xl lg:max-w-2xl">
      <form onSubmit={handleSubmit} className="relative w-full h-9 flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Buscar productos, marcas y más..."
          className="w-full bg-white h-9 py-1.5 pl-3.5 pr-16 rounded-sm shadow-xs border-none outline-none text-[13px] text-[#333] placeholder:text-gray-400"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Borrar texto"
            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
          >
            <TbX size={15} />
          </button>
        )}

        <button
          type="submit"
          aria-label="Buscar"
          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-[#333] bg-white border-l border-gray-200 hover:bg-gray-50 rounded-r-sm cursor-pointer flex items-center justify-center transition-colors"
        >
          {isLoading ? (
            <TbLoader2 size={16} className="animate-spin text-[#3483fa]" />
          ) : (
            <TbSearch size={16} />
          )}
        </button>
      </form>

      {/* Menú Flotante Predictivo (Desktop Dropdown) */}
      {(showRecent || showSuggestions) && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200/90 overflow-hidden z-50 animate-in fade-in duration-150 divide-y divide-gray-100">
          {/* 1. Búsquedas recientes */}
          {showRecent && (
            <div className="p-3">
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TbClock size={13} />
                  <span>Búsquedas recientes</span>
                </span>
                <button
                  type="button"
                  onClick={clearQueries}
                  className="text-[11px] text-gray-400 hover:text-rose-600 cursor-pointer"
                >
                  Borrar historial
                </button>
              </div>

              <div className="space-y-0.5">
                {recentQueries.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between px-2.5 py-1.5 hover:bg-gray-50 rounded-lg group transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleExecuteSearch(item)}
                      className="flex items-center gap-2 text-xs text-gray-700 font-medium text-left flex-1 cursor-pointer"
                    >
                      <TbSearch size={14} className="text-gray-400 group-hover:text-[#3483fa]" />
                      <span className="group-hover:text-[#3483fa]">{item}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuery(item);
                      }}
                      title="Eliminar de búsquedas recientes"
                      className="text-gray-300 hover:text-gray-600 p-0.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TbX size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Sugerencias de productos en vivo */}
          {showSuggestions && (
            <div>
              {isLoading && suggestions.length === 0 ? (
                <div className="flex items-center justify-center py-6 gap-2 text-xs text-gray-500">
                  <TbLoader2 className="animate-spin text-[#3483fa]" size={18} />
                  <span>Buscando en el catálogo...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="p-2 space-y-1">
                  <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider px-2 block mb-1">
                    Productos sugeridos
                  </span>

                  {suggestions.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug || p.id}`}
                      onClick={() => handleSelectProduct(p)}
                      className="flex items-center gap-3 p-2 hover:bg-blue-50/50 rounded-lg transition-colors group cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-md bg-white p-1 flex items-center justify-center shrink-0 border border-gray-100 group-hover:border-blue-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl || '/placeholder.png'}
                          alt={p.title}
                          className="object-contain w-full h-full"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 line-clamp-1 group-hover:text-[#3483fa] transition-colors">
                          {p.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.category?.name && (
                            <span className="text-[10px] text-gray-400 font-light flex items-center gap-1">
                              <TbTag size={10} />
                              {p.category.name}
                            </span>
                          )}
                          <span className="text-xs font-bold text-gray-900">
                            {symbol} {Number(p.price).toFixed(2)}
                          </span>
                          {p.discount && Number(p.discount) > 0 && (
                            <span className="text-[10px] font-bold text-[#00a650] bg-emerald-50 px-1 rounded">
                              {p.discount}% OFF
                            </span>
                          )}
                          {p.full && (
                            <span className="text-[#00a650] text-[10px] font-bold italic flex items-center">
                              <FaBolt size={8} className="mr-0.5" /> FULL
                            </span>
                          )}
                        </div>
                      </div>

                      <TbArrowRight
                        size={15}
                        className="text-gray-300 group-hover:text-[#3483fa] group-hover:translate-x-0.5 transition-all shrink-0"
                      />
                    </Link>
                  ))}

                  <div className="pt-2 mt-1 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleExecuteSearch(query)}
                      className="w-full py-2 px-3 text-center text-xs font-semibold text-[#3483fa] hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Ver todos los resultados para &quot;{query}&quot;</span>
                      <TbArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-gray-500">
                    No encontramos productos coincidentes con &quot;{query}&quot;
                  </p>
                  <button
                    type="button"
                    onClick={() => handleExecuteSearch(query)}
                    className="mt-2 text-xs font-semibold text-[#3483fa] hover:underline cursor-pointer"
                  >
                    Buscar de todos modos →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

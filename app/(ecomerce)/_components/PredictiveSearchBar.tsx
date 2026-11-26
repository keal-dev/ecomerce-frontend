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
      <div className="flex flex-col h-full w-full bg-white text-[#020202]">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3 bg-black border-b border-[#262626]">
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 text-neutral-300 hover:text-white rounded-none cursor-pointer transition-colors"
            aria-label="Cerrar búsqueda"
          >
            <TbArrowLeft size={20} strokeWidth={1.5} />
          </button>

          <div className="flex-1 relative flex items-center border-b border-white/30 focus-within:border-white transition-colors">
            <TbSearch size={16} strokeWidth={1.5} className="text-neutral-400 mr-2.5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="¿Qué estás buscando?"
              className="w-full bg-transparent py-2 pr-7 rounded-none outline-none text-xs tracking-wide text-white placeholder:text-neutral-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-1 text-neutral-400 hover:text-white p-0.5 cursor-pointer transition-colors"
              >
                <TbX size={15} strokeWidth={1.5} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-300 hover:text-white cursor-pointer transition-colors shrink-0"
          >
            Buscar
          </button>
        </form>

        {/* Contenido desplegable en móvil */}
        <div className="flex-1 overflow-y-auto bg-white p-3 divide-y divide-neutral-200">
          {/* Búsquedas recientes en móvil */}
          {query.trim().length < 2 && hasRecent && (
            <div className="py-2">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Búsquedas recientes
                </span>
                <button
                  type="button"
                  onClick={clearQueries}
                  className="text-[11px] text-neutral-500 hover:text-brand-accent cursor-pointer"
                >
                  Borrar historial
                </button>
              </div>
              <div className="space-y-1">
                {recentQueries.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between px-2.5 py-2 hover:bg-neutral-50 group"
                  >
                    <button
                      type="button"
                      onClick={() => handleExecuteSearch(item)}
                      className="flex items-center gap-2.5 text-xs text-neutral-800 font-medium text-left flex-1 cursor-pointer"
                    >
                      <TbClock size={16} className="text-neutral-400" />
                      <span>{item}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuery(item);
                      }}
                      className="text-neutral-400 hover:text-brand-accent p-1 cursor-pointer"
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
                <div className="flex items-center justify-center py-8 gap-2 text-xs text-neutral-500">
                  <TbLoader2 className="animate-spin text-brand-accent" size={20} />
                  <span>Buscando en nuestro catálogo...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-1 py-1">
                  {suggestions.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug || p.id}`}
                      onClick={() => handleSelectProduct(p)}
                      className="flex items-center gap-3 p-2 hover:bg-neutral-50 transition-colors border border-transparent hover:border-[#d9d9d9]"
                    >
                      <div className="w-12 h-12 rounded-none bg-[#f8f8f8] p-1 flex items-center justify-center shrink-0 border border-[#d9d9d9]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl || '/placeholder.png'}
                          alt={p.title}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-black line-clamp-1">
                          {p.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-black">
                            {symbol} {Number(p.price).toFixed(2)}
                          </span>
                          {p.discount && Number(p.discount) > 0 && (
                            <span className="text-[10px] font-bold text-white bg-brand-accent px-1">
                              -{p.discount}%
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleExecuteSearch(query)}
                    className="w-full mt-3 py-2.5 px-3 bg-black hover:bg-brand-accent text-white text-xs font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Ver todos los resultados para &quot;{query}&quot;</span>
                    <TbArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-neutral-500">
                  <p>No hay coincidencias rápidas para &quot;{query}&quot;</p>
                  <button
                    type="button"
                    onClick={() => handleExecuteSearch(query)}
                    className="mt-2 text-brand-accent font-bold uppercase underline cursor-pointer"
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
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="group relative w-full h-10 flex items-center bg-transparent border-b border-white/25 hover:border-white/50 focus-within:border-white transition-colors duration-200"
      >
        <span className="text-neutral-400 group-focus-within:text-white transition-colors mr-3 shrink-0 flex items-center">
          {isLoading ? (
            <TbLoader2 size={17} strokeWidth={1.5} className="animate-spin text-white" />
          ) : (
            <TbSearch size={17} strokeWidth={1.5} />
          )}
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="¿Qué estás buscando? Vinos, chocolates, cacao, café..."
          className="w-full bg-transparent h-full py-1.5 pr-2 text-[13px] tracking-wide text-white placeholder:text-neutral-400 outline-none"
        />

        {query && (
          <div className="flex items-center gap-2 shrink-0 pl-2">
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Borrar texto"
              className="text-neutral-500 hover:text-white p-1 cursor-pointer transition-colors"
            >
              <TbX size={15} strokeWidth={1.5} />
            </button>

            <button
              type="submit"
              aria-label="Buscar"
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-300 hover:text-white cursor-pointer transition-colors py-1"
            >
              <span>Buscar</span>
              <TbArrowRight size={13} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </form>

      {/* Menú Flotante Predictivo (Desktop Dropdown) */}
      {(showRecent || showSuggestions) && (
        <div className="absolute left-0 right-0 top-full mt-3 bg-white rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.22)] border border-neutral-200 overflow-hidden z-50 animate-in fade-in duration-150 divide-y divide-neutral-200 text-[#020202]">
          {/* 1. Búsquedas recientes */}
          {showRecent && (
            <div className="p-3.5">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <TbClock size={12} />
                  <span>Búsquedas recientes</span>
                </span>
                <button
                  type="button"
                  onClick={clearQueries}
                  className="text-[11px] text-neutral-500 hover:text-brand-accent cursor-pointer"
                >
                  Borrar historial
                </button>
              </div>

              <div className="space-y-0.5">
                {recentQueries.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between px-2.5 py-1.5 hover:bg-neutral-50 group transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleExecuteSearch(item)}
                      className="flex items-center gap-2 text-xs text-neutral-700 font-medium text-left flex-1 cursor-pointer"
                    >
                      <TbSearch size={14} className="text-neutral-400 group-hover:text-brand-accent" />
                      <span className="group-hover:text-brand-accent">{item}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuery(item);
                      }}
                      title="Eliminar de búsquedas recientes"
                      className="text-neutral-300 hover:text-neutral-700 p-0.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
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
                <div className="flex items-center justify-center py-6 gap-2 text-xs text-neutral-500">
                  <TbLoader2 className="animate-spin text-brand-accent" size={18} />
                  <span>Buscando en nuestro catálogo...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="p-2 space-y-1">
                  <span className="text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider px-2 block mb-1">
                    Productos sugeridos
                  </span>

                  {suggestions.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug || p.id}`}
                      onClick={() => handleSelectProduct(p)}
                      className="flex items-center gap-3 p-2 hover:bg-neutral-50 transition-colors group cursor-pointer"
                    >
                      <div className="w-11 h-11 bg-[#f8f8f8] p-1 flex items-center justify-center shrink-0 border border-neutral-200 group-hover:border-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl || '/placeholder.png'}
                          alt={p.title}
                          className="object-contain w-full h-full"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-black line-clamp-1 group-hover:text-brand-accent transition-colors">
                          {p.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.category?.name && (
                            <span className="text-[10px] text-neutral-500 font-normal flex items-center gap-1">
                              <TbTag size={10} />
                              {p.category.name}
                            </span>
                          )}
                          <span className="text-xs font-bold text-black">
                            {symbol} {Number(p.price).toFixed(2)}
                          </span>
                          {p.discount && Number(p.discount) > 0 && (
                            <span className="text-[10px] font-bold text-white bg-brand-accent px-1">
                              -{p.discount}%
                            </span>
                          )}
                          {p.full && (
                            <span className="text-[#2e9e7b] text-[10px] font-bold italic flex items-center">
                              <FaBolt size={8} className="mr-0.5" /> EXPRESS
                            </span>
                          )}
                        </div>
                      </div>

                      <TbArrowRight
                        size={15}
                        className="text-neutral-300 group-hover:text-brand-accent group-hover:translate-x-0.5 transition-all shrink-0"
                      />
                    </Link>
                  ))}

                  <div className="pt-2 mt-1 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => handleExecuteSearch(query)}
                      className="w-full py-2.5 px-3 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-white bg-black hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Ver todos los resultados para &quot;{query}&quot;</span>
                      <TbArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-neutral-500">
                    No encontramos productos coincidentes con &quot;{query}&quot;
                  </p>
                  <button
                    type="button"
                    onClick={() => handleExecuteSearch(query)}
                    className="mt-2 text-xs font-bold uppercase text-brand-accent hover:underline cursor-pointer"
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

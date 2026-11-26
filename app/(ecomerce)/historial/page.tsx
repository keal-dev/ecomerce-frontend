'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { TbChevronRight, TbLoader2, TbSearchOff } from 'react-icons/tb';
import { useRecentlyViewedStore } from '@/stores/recently-viewed.store';
import { useProductStore } from '@/stores/product.store';
import { Product } from '@/types/product.types';
import { HistoryHeader } from './_components/HistoryHeader';
import { HistoryCard } from './_components/HistoryCard';
import { HistoryEmptyState } from './_components/HistoryEmptyState';

export default function HistoryPage() {
  const { viewedIds, removeViewedId, clearHistory } = useRecentlyViewedStore();
  const { products, fetchProducts, isLoading } = useProductStore();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'discount' | 'shipping'>('all');

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, [fetchProducts]);

  const historyProducts = useMemo(() => {
    if (!mounted || !viewedIds || viewedIds.length === 0 || products.length === 0) {
      return [];
    }

    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.id, p));

    const result: Product[] = [];
    viewedIds.forEach((id) => {
      const prod = map.get(id);
      if (prod && prod.isActive !== false) {
        result.push(prod);
      }
    });

    return result;
  }, [mounted, viewedIds, products]);

  const filteredProducts = useMemo(() => {
    let list = historyProducts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q),
      );
    }

    if (activeFilter === 'discount') {
      list = list.filter(
        (p) =>
          (p.discount && Number(p.discount) > 0) ||
          (p.originalPrice && Number(p.originalPrice) > Number(p.price)),
      );
    } else if (activeFilter === 'shipping') {
      list = list.filter((p) => p.freeShipping === true);
    }

    return list;
  }, [historyProducts, searchQuery, activeFilter]);

  const recommendedProducts = useMemo(() => {
    return products.filter((p) => p.isActive !== false).slice(0, 10);
  }, [products]);

  if (!mounted || (isLoading && products.length === 0)) {
    return (
      <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center gap-3">
        <TbLoader2 className="animate-spin text-[#de2a2a]" size={36} />
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Cargando tu historial...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-500 mb-5">
          <Link href="/" className="hover:text-[#de2a2a] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-neutral-400" />
          <span className="text-black font-bold">Historial</span>
        </nav>

        {/* Encabezado con buscador y filtros */}
        <HistoryHeader
          totalCount={historyProducts.length}
          filteredCount={filteredProducts.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onClearAll={clearHistory}
        />

        {historyProducts.length === 0 ? (
          <HistoryEmptyState recommendedProducts={recommendedProducts} />
        ) : filteredProducts.length === 0 ? (
          <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-8 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 bg-black text-white rounded-none flex items-center justify-center mx-auto mb-3">
              <TbSearchOff size={24} />
            </div>
            <h3 className="font-display text-base font-extrabold uppercase text-black">
              No encontramos publicaciones que coincidan
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-xs mx-auto">
              Revisa si escribiste bien el término de búsqueda o restablece los filtros aplicados.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="px-5 py-2.5 bg-[#de2a2a] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer"
              >
                Restablecer búsqueda
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <HistoryCard
                key={product.id}
                product={product}
                onRemove={removeViewedId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

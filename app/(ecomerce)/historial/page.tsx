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

  // Lista de productos visitados respetando el orden cronológico (más reciente primero)
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

  // Filtrado por buscador y chips
  const filteredProducts = useMemo(() => {
    let list = historyProducts;

    // Filtro por término de búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q),
      );
    }

    // Filtro por píldoras
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

  // Recomendados para el estado vacío o complementario
  const recommendedProducts = useMemo(() => {
    return products.filter((p) => p.isActive !== false).slice(0, 10);
  }, [products]);

  // Evitar desajuste de renderizado inicial de hidratación
  if (!mounted || (isLoading && products.length === 0)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <TbLoader2 className="animate-spin text-[#3483fa]" size={36} />
        <p className="text-xs text-gray-500">Cargando tu historial...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-light">
          <Link href="/" className="hover:text-[#3483fa] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-800 font-medium">Historial</span>
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

        {/* Si no hay productos en el historial en absoluto */}
        {historyProducts.length === 0 ? (
          <HistoryEmptyState recommendedProducts={recommendedProducts} />
        ) : filteredProducts.length === 0 ? (
          /* Si hay historial pero el filtro o búsqueda no coincide */
          <div className="bg-white rounded-2xl border border-gray-200/80 p-8 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <TbSearchOff size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              No encontramos publicaciones que coincidan
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Revisa si escribiste bien el término de búsqueda o restablece los filtros aplicados.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Restablecer búsqueda
              </button>
            </div>
          </div>
        ) : (
          /* Grid de productos en el historial */
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

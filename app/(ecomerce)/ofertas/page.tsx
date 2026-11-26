'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { TbChevronRight, TbLoader2, TbX } from 'react-icons/tb';
import { useProductStore } from '@/stores/product.store';
import { Product } from '@/types/product.types';
import { DealsHeroBanner } from './_components/DealsHeroBanner';
import { DealsFilters, DealsFilterState } from './_components/DealsFilters';
import { DealsProductGrid, DealsSortOption } from './_components/DealsProductGrid';

const initialFilters: DealsFilterState = {
  minDiscount: 0,
  categoryId: null,
  onlyFreeShipping: false,
  onlyFull: false,
  minPrice: '',
  maxPrice: '',
};

export default function OffersPage() {
  const { products, fetchProducts, isLoading } = useProductStore();
  const [filters, setFilters] = useState<DealsFilterState>(initialFilters);
  const [activeQuickTab, setActiveQuickTab] = useState<string>('all');
  const [sortBy, setSortBy] = useState<DealsSortOption>('discount_desc');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProductDiscountPercent = (p: Product): number => {
    if (p.discount && p.discount > 0) return Number(p.discount);
    if (p.originalPrice && Number(p.originalPrice) > Number(p.price)) {
      return Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100);
    }
    return 0;
  };

  const allDealProducts = useMemo(() => {
    const deals = products.filter(
      (p) =>
        p.isActive !== false &&
        (getProductDiscountPercent(p) > 0 || (p.originalPrice && Number(p.originalPrice) > Number(p.price))),
    );

    if (deals.length < 4) {
      const remaining = products.filter(
        (p) => p.isActive !== false && !deals.some((d) => d.id === p.id),
      );
      return [...deals, ...remaining];
    }

    return deals;
  }, [products]);

  const handleQuickTabChange = (tabId: string) => {
    setActiveQuickTab(tabId);
    if (tabId === 'all') {
      setFilters((prev) => ({ ...prev, minDiscount: 0, onlyFreeShipping: false }));
    } else if (tabId === '40plus') {
      setFilters((prev) => ({ ...prev, minDiscount: 40, onlyFreeShipping: false }));
    } else if (tabId === '20to40') {
      setFilters((prev) => ({ ...prev, minDiscount: 20, onlyFreeShipping: false }));
    } else if (tabId === 'free_shipping') {
      setFilters((prev) => ({ ...prev, onlyFreeShipping: true, minDiscount: 0 }));
    }
  };

  const handleFilterChange = (partial: Partial<DealsFilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setActiveQuickTab('custom');
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setActiveQuickTab('all');
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.minDiscount > 0 ||
      filters.categoryId !== null ||
      filters.onlyFreeShipping ||
      filters.onlyFull ||
      Boolean(filters.minPrice.trim()) ||
      Boolean(filters.maxPrice.trim())
    );
  }, [filters]);

  const dealCategories = useMemo(() => {
    const categoryMap = new Map<string, { id: string; name: string; count: number }>();

    allDealProducts.forEach((p) => {
      if (p.category && p.categoryId) {
        const existing = categoryMap.get(p.categoryId);
        if (existing) {
          existing.count += 1;
        } else {
          categoryMap.set(p.categoryId, {
            id: p.categoryId,
            name: p.category.name,
            count: 1,
          });
        }
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  }, [allDealProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    const result = allDealProducts.filter((p) => {
      const discount = getProductDiscountPercent(p);

      if (filters.minDiscount > 0 && discount < filters.minDiscount) {
        return false;
      }

      if (activeQuickTab === '20to40' && (discount < 20 || discount > 40)) {
        return false;
      }

      if (filters.categoryId && p.categoryId !== filters.categoryId) {
        return false;
      }

      if (filters.onlyFreeShipping && !p.freeShipping) {
        return false;
      }

      if (filters.onlyFull && !p.full) {
        return false;
      }

      if (filters.minPrice.trim()) {
        const min = parseFloat(filters.minPrice);
        if (!isNaN(min) && Number(p.price) < min) return false;
      }

      if (filters.maxPrice.trim()) {
        const max = parseFloat(filters.maxPrice);
        if (!isNaN(max) && Number(p.price) > max) return false;
      }

      return true;
    });

    return result.sort((a, b) => {
      const discA = getProductDiscountPercent(a);
      const discB = getProductDiscountPercent(b);
      const priceA = Number(a.price);
      const priceB = Number(b.price);

      if (sortBy === 'discount_desc') {
        return discB - discA;
      }
      if (sortBy === 'price_asc') {
        return priceA - priceB;
      }
      if (sortBy === 'price_desc') {
        return priceB - priceA;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [allDealProducts, filters, activeQuickTab, sortBy]);

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-7 pt-6">
        {/* Breadcrumb de Navegación */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-500 mb-5">
          <Link href="/" className="hover:text-brand-accent transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-neutral-400" />
          <span className="text-black font-bold">Promos & Ofertas</span>
        </nav>

        {/* Hero Banner de Ofertas */}
        <DealsHeroBanner
          activeTab={activeQuickTab}
          onTabChange={handleQuickTabChange}
          totalDealsCount={allDealProducts.length}
        />

        {/* Contenido Principal con Layout de 2 Columnas (Filtros + Grid) */}
        {isLoading && products.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 text-neutral-500">
            <TbLoader2 size={32} className="animate-spin text-brand-accent" />
            <p className="text-xs font-bold uppercase tracking-wider">Cargando promos del día...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Columna Izquierda (1/4): Filtros en Escritorio */}
            <aside className="hidden lg:block lg:col-span-1 sticky top-24">
              <DealsFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                categories={dealCategories}
                hasActiveFilters={hasActiveFilters}
              />
            </aside>

            {/* Columna Derecha (3/4): Cuadrícula de Ofertas */}
            <main className="lg:col-span-3">
              <DealsProductGrid
                products={filteredAndSortedProducts}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
                onResetFilters={handleResetFilters}
              />
            </main>
          </div>
        )}
      </div>

      {/* Modal / Drawer de Filtros para Móviles */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl overflow-y-auto z-10 flex flex-col justify-between rounded-none border-l border-[#d9d9d9]">
            <div>
              <div className="flex items-center justify-between p-4 bg-black text-white border-b border-[#262626]">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-wider">
                  Filtros de Promos
                </h3>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 text-neutral-300 hover:text-white cursor-pointer"
                >
                  <TbX size={20} />
                </button>
              </div>

              <div className="p-4">
                <DealsFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                  categories={dealCategories}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#d9d9d9] sticky bottom-0 bg-[#f8f8f8]">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-brand-accent hover:bg-red-700 text-white rounded-none text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Ver resultados ({filteredAndSortedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

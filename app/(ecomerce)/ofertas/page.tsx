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

  // Función auxiliar para calcular el porcentaje de descuento exacto
  const getProductDiscountPercent = (p: Product): number => {
    if (p.discount && p.discount > 0) return Number(p.discount);
    if (p.originalPrice && Number(p.originalPrice) > Number(p.price)) {
      return Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100);
    }
    return 0;
  };

  // Base de productos con oferta activa (descuento > 0 o precio tachado)
  const allDealProducts = useMemo(() => {
    const deals = products.filter(
      (p) =>
        p.isActive !== false &&
        (getProductDiscountPercent(p) > 0 || (p.originalPrice && Number(p.originalPrice) > Number(p.price))),
    );

    // Si aún hay pocos productos con descuento explícito en la base de datos,
    // mostramos los que tienen oferta primero y completamos con el catálogo activo
    if (deals.length < 4) {
      const remaining = products.filter(
        (p) => p.isActive !== false && !deals.some((d) => d.id === p.id),
      );
      return [...deals, ...remaining];
    }

    return deals;
  }, [products]);

  // Manejador del cambio de pestaña rápida del banner
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

  // Lista de categorías con conteo de ofertas disponibles
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

  // Filtrado y Ordenamiento final de productos
  const filteredAndSortedProducts = useMemo(() => {
    let result = allDealProducts.filter((p) => {
      const discount = getProductDiscountPercent(p);

      // Filtro por descuento mínimo
      if (filters.minDiscount > 0 && discount < filters.minDiscount) {
        return false;
      }

      // Filtro pestaña rápida 20 a 40
      if (activeQuickTab === '20to40' && (discount < 20 || discount > 40)) {
        return false;
      }

      // Filtro por categoría
      if (filters.categoryId && p.categoryId !== filters.categoryId) {
        return false;
      }

      // Filtro por envío gratis
      if (filters.onlyFreeShipping && !p.freeShipping) {
        return false;
      }

      // Filtro por Full
      if (filters.onlyFull && !p.full) {
        return false;
      }

      // Filtro por precio mínimo
      if (filters.minPrice.trim()) {
        const min = parseFloat(filters.minPrice);
        if (!isNaN(min) && Number(p.price) < min) return false;
      }

      // Filtro por precio máximo
      if (filters.maxPrice.trim()) {
        const max = parseFloat(filters.maxPrice);
        if (!isNaN(max) && Number(p.price) > max) return false;
      }

      return true;
    });

    // Ordenamiento
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
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-7 pt-4 sm:pt-6">
        {/* Breadcrumb de Navegación */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-900 font-bold">Ofertas</span>
        </nav>

        {/* Hero Banner de Ofertas */}
        <DealsHeroBanner
          activeTab={activeQuickTab}
          onTabChange={handleQuickTabChange}
          totalDealsCount={allDealProducts.length}
        />

        {/* Contenido Principal con Layout de 2 Columnas (Filtros + Grid) */}
        {isLoading && products.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 text-gray-500">
            <TbLoader2 size={32} className="animate-spin text-[#3483fa]" />
            <p className="text-xs font-semibold">Cargando ofertas del día...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Columna Izquierda (1/4): Filtros en Escritorio */}
            <aside className="hidden lg:block lg:col-span-1 sticky top-4">
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
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-4 overflow-y-auto z-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Filtros de Ofertas</h3>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <TbX size={18} />
                </button>
              </div>

              <DealsFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                categories={dealCategories}
                hasActiveFilters={hasActiveFilters}
              />
            </div>

            <div className="pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-2.5 bg-[#3483fa] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-600 transition-colors"
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

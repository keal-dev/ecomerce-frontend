'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TbChevronRight, TbLoader2, TbX } from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';
import { useProductStore } from '@/stores/product.store';
import { getProducts } from '@/services/product.service';
import { Product } from '@/types/product.types';
import { ProductCard } from '@/app/(ecomerce)/_components/ProductCard';
import { SearchFilters, SearchFilterState } from './_components/SearchFilters';
import { SearchHeader, SearchSortOption } from './_components/SearchHeader';
import { SearchEmptyState } from './_components/SearchEmptyState';

const initialFilters: SearchFilterState = {
  categoryId: null,
  onlyFreeShipping: false,
  onlyFull: false,
  onlyDeals: false,
  minPrice: '',
  maxPrice: '',
};

function SearchContent() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const query = rawQuery.trim();

  const { company } = useCompanyStore();
  const symbol = company?.currencySymbol || 'S/';

  const { products: storeProducts, fetchProducts } = useProductStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilterState>(initialFilters);
  const [sortBy, setSortBy] = useState<SearchSortOption>('relevance');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    let isMounted = true;

    async function executeSearch() {
      setIsLoading(true);
      try {
        const results = await getProducts({
          search: query || undefined,
          isActive: true,
        });
        if (isMounted) {
          setProducts(results || []);
        }
      } catch (err) {
        console.error('Error al buscar productos:', err);
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    executeSearch();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const categoryFacets = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();

    products.forEach((p) => {
      if (p.category?.id && p.category?.name) {
        const existing = map.get(p.category.id);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(p.category.id, {
            id: p.category.id,
            name: p.category.name,
            count: 1,
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [products]);

  const handleFilterChange = (partial: Partial<SearchFilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.categoryId !== null ||
      filters.onlyFreeShipping ||
      filters.onlyFull ||
      filters.onlyDeals ||
      Boolean(filters.minPrice.trim()) ||
      Boolean(filters.maxPrice.trim())
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categoryId !== null) count++;
    if (filters.onlyFreeShipping) count++;
    if (filters.onlyFull) count++;
    if (filters.onlyDeals) count++;
    if (filters.minPrice.trim()) count++;
    if (filters.maxPrice.trim()) count++;
    return count;
  }, [filters]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (filters.categoryId) {
      list = list.filter(
        (p) => p.category?.id === filters.categoryId || p.categoryId === filters.categoryId,
      );
    }

    if (filters.onlyFreeShipping) {
      list = list.filter((p) => p.freeShipping === true);
    }

    if (filters.onlyFull) {
      list = list.filter((p) => p.full === true);
    }

    if (filters.onlyDeals) {
      list = list.filter(
        (p) =>
          (p.discount && Number(p.discount) > 0) ||
          (p.originalPrice && Number(p.originalPrice) > Number(p.price)),
      );
    }

    if (filters.minPrice.trim()) {
      const min = parseFloat(filters.minPrice);
      if (!isNaN(min)) {
        list = list.filter((p) => Number(p.price) >= min);
      }
    }

    if (filters.maxPrice.trim()) {
      const max = parseFloat(filters.maxPrice);
      if (!isNaN(max)) {
        list = list.filter((p) => Number(p.price) <= max);
      }
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'discount_desc') {
      list.sort((a, b) => Number(b.discount || 0) - Number(a.discount || 0));
    } else if (sortBy === 'relevance' && query) {
      const q = query.toLowerCase();
      list.sort((a, b) => {
        const aTitle = a.title.toLowerCase().startsWith(q)
          ? 2
          : a.title.toLowerCase().includes(q)
            ? 1
            : 0;
        const bTitle = b.title.toLowerCase().startsWith(q)
          ? 2
          : b.title.toLowerCase().includes(q)
            ? 1
            : 0;
        return bTitle - aTitle;
      });
    }

    return list;
  }, [products, filters, sortBy, query]);

  const recommendedProducts = useMemo(() => {
    return storeProducts.filter((p) => p.isActive !== false).slice(0, 10);
  }, [storeProducts]);

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-500 mb-4">
          <Link href="/" className="hover:text-[#de2a2a] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-neutral-400" />
          <span className="text-neutral-500">Búsqueda</span>
          {query && (
            <>
              <TbChevronRight size={13} className="text-neutral-400" />
              <span className="text-black font-bold truncate max-w-xs">{query}</span>
            </>
          )}
        </nav>

        {/* Encabezado con contador y opciones de ordenamiento */}
        <SearchHeader
          query={query}
          totalResults={filteredProducts.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        {isLoading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
            <TbLoader2 className="animate-spin text-[#de2a2a]" size={36} />
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Buscando productos para &quot;{query}&quot;...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <SearchEmptyState
            query={query}
            hasFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
            recommendedProducts={recommendedProducts}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Barra lateral de filtros (Escritorio) */}
            <div className="hidden lg:block lg:col-span-1 sticky top-24">
              <SearchFilters
                filters={filters}
                categories={categoryFacets}
                currencySymbol={symbol}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>

            {/* Rejilla de Productos */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((p) => {
                  const cardProduct = {
                    id: p.id,
                    title: p.title,
                    slug: p.slug,
                    price: Number(p.price),
                    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
                    discount: p.discount ? Number(p.discount) : null,
                    freeShipping: p.freeShipping ?? false,
                    full: p.full ?? false,
                    imageUrl: p.imageUrl || '/placeholder.png',
                    description: p.description,
                    stock: p.stock,
                  };

                  return <ProductCard key={p.id} product={cardProduct} />;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Drawer de filtros para móvil */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileFiltersOpen(false)}
            />

            <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 rounded-none border-l border-[#d9d9d9]">
              <div className="flex items-center justify-between p-4 bg-black text-white border-b border-[#262626]">
                <span className="font-display text-sm font-extrabold uppercase tracking-wider">
                  Filtrar resultados
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 text-neutral-300 hover:text-white cursor-pointer"
                >
                  <TbX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <SearchFilters
                  filters={filters}
                  categories={categoryFacets}
                  currencySymbol={symbol}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>

              <div className="p-4 border-t border-[#d9d9d9] bg-[#f8f8f8]">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full py-3 bg-[#de2a2a] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-none text-center cursor-pointer transition-colors"
                >
                  Ver {filteredProducts.length} resultados
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center gap-3">
          <TbLoader2 className="animate-spin text-[#de2a2a]" size={36} />
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Cargando búsqueda...
          </p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

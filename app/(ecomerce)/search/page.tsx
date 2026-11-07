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

  // Cargar catálogo inicial y buscar productos con el término de la query
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

  // Lista de categorías con conteo dinámico basado en los resultados encontrados
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

  // Manejador de filtros
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

  // Productos filtrados y ordenados
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filtro por categoría
    if (filters.categoryId) {
      list = list.filter((p) => p.category?.id === filters.categoryId || p.categoryId === filters.categoryId);
    }

    // Filtro Envío Gratis
    if (filters.onlyFreeShipping) {
      list = list.filter((p) => p.freeShipping === true);
    }

    // Filtro FULL
    if (filters.onlyFull) {
      list = list.filter((p) => p.full === true);
    }

    // Filtro Solo Ofertas
    if (filters.onlyDeals) {
      list = list.filter(
        (p) =>
          (p.discount && Number(p.discount) > 0) ||
          (p.originalPrice && Number(p.originalPrice) > Number(p.price)),
      );
    }

    // Filtro Precio Mínimo
    if (filters.minPrice.trim()) {
      const min = parseFloat(filters.minPrice);
      if (!isNaN(min)) {
        list = list.filter((p) => Number(p.price) >= min);
      }
    }

    // Filtro Precio Máximo
    if (filters.maxPrice.trim()) {
      const max = parseFloat(filters.maxPrice);
      if (!isNaN(max)) {
        list = list.filter((p) => Number(p.price) <= max);
      }
    }

    // Ordenamiento
    if (sortBy === 'price_asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'discount_desc') {
      list.sort((a, b) => Number(b.discount || 0) - Number(a.discount || 0));
    } else if (sortBy === 'relevance' && query) {
      const q = query.toLowerCase();
      list.sort((a, b) => {
        const aTitle = a.title.toLowerCase().startsWith(q) ? 2 : a.title.toLowerCase().includes(q) ? 1 : 0;
        const bTitle = b.title.toLowerCase().startsWith(q) ? 2 : b.title.toLowerCase().includes(q) ? 1 : 0;
        return bTitle - aTitle;
      });
    }

    return list;
  }, [products, filters, sortBy, query]);

  // Productos de respaldo / recomendados en caso de vacío
  const recommendedProducts = useMemo(() => {
    return storeProducts.filter((p) => p.isActive !== false).slice(0, 10);
  }, [storeProducts]);

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-light">
          <Link href="/" className="hover:text-[#3483fa] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-500">Búsqueda</span>
          {query && (
            <>
              <TbChevronRight size={13} className="text-gray-400" />
              <span className="text-gray-800 font-medium truncate max-w-xs">{query}</span>
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
            <TbLoader2 className="animate-spin text-[#3483fa]" size={36} />
            <p className="text-xs text-gray-500">Buscando publicaciones para &quot;{query}&quot;...</p>
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
            <div className="hidden lg:block lg:col-span-1 sticky top-20">
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
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileFiltersOpen(false)}
            />

            {/* Panel lateral */}
            <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-900">Filtrar resultados</span>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-900 rounded-lg"
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

              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full py-2.5 bg-[#3483fa] text-white text-xs font-semibold rounded-xl text-center shadow-xs cursor-pointer"
                >
                  Ver {filteredProducts.length} publicaciones
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
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <TbLoader2 className="animate-spin text-[#3483fa]" size={36} />
          <p className="text-xs text-gray-500">Cargando búsqueda...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

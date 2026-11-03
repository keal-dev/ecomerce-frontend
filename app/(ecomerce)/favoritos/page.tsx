'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { TbChevronRight, TbHeartOff, TbTrash, TbFlame, TbHome, TbLoader2 } from 'react-icons/tb';
import { useFavoritesStore } from '@/stores/favorites.store';
import { useProductStore } from '@/stores/product.store';
import { ProductCard } from '@/app/(ecomerce)/_components/ProductCard';

export default function FavoritesPage() {
  const { favoriteIds, clearFavorites } = useFavoritesStore();
  const { products, fetchProducts, isLoading } = useProductStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, [fetchProducts]);

  // Obtener los productos favoritos respetando el orden en que se agregaron
  const favoriteProducts = useMemo(() => {
    if (!mounted || favoriteIds.length === 0 || products.length === 0) return [];

    const map = new Map();
    products.forEach((p) => map.set(p.id, p));

    const list: typeof products = [];
    favoriteIds.forEach((id) => {
      const prod = map.get(id);
      if (prod && prod.isActive !== false) {
        list.push(prod);
      }
    });

    return list;
  }, [mounted, favoriteIds, products]);

  // Recomendados para cuando está vacío
  const recommendedProducts = useMemo(() => {
    return products.filter((p) => p.isActive !== false).slice(0, 10);
  }, [products]);

  if (!mounted || (isLoading && products.length === 0)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <TbLoader2 className="animate-spin text-[#3483fa]" size={36} />
        <p className="text-xs text-gray-500">Cargando tus favoritos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ebebeb]/50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-light">
          <Link href="/" className="hover:text-[#3483fa] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-800 font-medium">Mis Favoritos</span>
        </nav>

        {/* Encabezado */}
        <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-4 sm:p-5 mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">
                Mis Favoritos
              </h1>
              <span className="bg-rose-50 text-rose-600 border border-rose-100 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {favoriteProducts.length} {favoriteProducts.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-light">
              Tus publicaciones y artículos guardados para ver o comprar después
            </p>
          </div>

          {favoriteProducts.length > 0 && (
            <button
              type="button"
              onClick={clearFavorites}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <TbTrash size={15} />
              <span>Vaciar lista</span>
            </button>
          )}
        </div>

        {/* Contenido */}
        {favoriteProducts.length === 0 ? (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-8 sm:p-12 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <TbHeartOff size={32} />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                No tienes productos en favoritos
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed font-light">
                Haz clic en el corazón de cualquier publicación para guardarla aquí y no perderla de vista.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/ofertas"
                  className="px-5 py-2.5 bg-[#3483fa] hover:bg-[#2968c8] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <TbFlame size={16} />
                  <span>Descubrir ofertas</span>
                </Link>

                <Link
                  href="/"
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  <TbHome size={16} />
                  <span>Ir a la tienda</span>
                </Link>
              </div>
            </div>

            {/* Recomendados */}
            {recommendedProducts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs">
                <div className="flex items-center gap-2 mb-4">
                  <TbFlame className="text-[#00a650]" size={20} />
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Productos que podrían interesarte
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {recommendedProducts.map((p) => {
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
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {favoriteProducts.map((p) => {
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
        )}
      </div>
    </div>
  );
}

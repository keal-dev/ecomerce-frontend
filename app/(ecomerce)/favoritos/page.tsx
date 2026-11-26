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

  const recommendedProducts = useMemo(() => {
    return products.filter((p) => p.isActive !== false).slice(0, 10);
  }, [products]);

  if (!mounted || (isLoading && products.length === 0)) {
    return (
      <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center gap-3">
        <TbLoader2 className="animate-spin text-brand-accent" size={36} />
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Cargando tus favoritos...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-500 mb-5">
          <Link href="/" className="hover:text-brand-accent transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-neutral-400" />
          <span className="text-black font-bold">Mis Favoritos</span>
        </nav>

        {/* Encabezado */}
        <div className="bg-black text-white rounded-none border-b-4 border-brand-accent p-5 sm:p-7 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
                Mis Favoritos
              </h1>
              <span className="bg-brand-accent text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-none">
                {favoriteProducts.length} {favoriteProducts.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1">
              Tus productos favoritos guardados para ver o comprar después.
            </p>
          </div>

          {favoriteProducts.length > 0 && (
            <button
              type="button"
              onClick={clearFavorites}
              className="text-xs text-white hover:text-brand-accent font-bold uppercase tracking-wider flex items-center gap-1.5 px-3.5 py-2 border border-[#262626] hover:border-brand-accent rounded-none transition-colors cursor-pointer self-start sm:self-auto"
            >
              <TbTrash size={15} />
              <span>Vaciar lista</span>
            </button>
          )}
        </div>

        {/* Contenido */}
        {favoriteProducts.length === 0 ? (
          <div className="space-y-10">
            <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-8 sm:p-12 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 bg-black text-white rounded-none flex items-center justify-center mx-auto mb-5">
                <TbHeartOff size={32} />
              </div>

              <h2 className="font-display text-lg sm:text-xl font-extrabold uppercase tracking-tight text-black">
                No tienes productos en favoritos
              </h2>

              <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Haz clic en el corazón de cualquier producto o pack para guardarlo aquí y no perderlo de vista.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/ofertas"
                  className="px-5 py-2.5 bg-brand-accent hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-none transition-colors flex items-center gap-2"
                >
                  <TbFlame size={16} />
                  <span>Descubrir ofertas</span>
                </Link>

                <Link
                  href="/"
                  className="px-5 py-2.5 border border-black bg-white hover:bg-black hover:text-white text-black text-xs font-bold uppercase tracking-widest rounded-none transition-colors flex items-center gap-2"
                >
                  <TbHome size={16} />
                  <span>Ir a la tienda</span>
                </Link>
              </div>
            </div>

            {/* Recomendados */}
            {recommendedProducts.length > 0 && (
              <div className="bg-white rounded-none border border-[#d9d9d9] p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#d9d9d9]">
                  <TbFlame className="text-brand-accent" size={20} />
                  <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-black">
                    Recomendados de nuestra cooperativa
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
                      stock: p.stock,
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
                stock: p.stock,
              };

              return <ProductCard key={p.id} product={cardProduct} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

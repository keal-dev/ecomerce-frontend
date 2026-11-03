'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MainCarousel } from './_components/MainCarousel';
import { ProductCarousel } from './_components/ProductCarousel';
import { CategoryCarousel } from './_components/CategoryCarousel';
import { BrandsCarousel } from './_components/BrandsCarousel';
import { useProductStore } from '@/stores/product.store';
import { useRecentlyViewedStore } from '@/stores/recently-viewed.store';
import { Product } from '@/types/product.types';

export default function Ecomerce() {
  const { products, fetchProducts, isLoading } = useProductStore();
  const { viewedIds, clearHistory } = useRecentlyViewedStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, [fetchProducts]);

  // Vistos recientemente desde localStorage (ordenados por el más reciente)
  const recentlyViewedProducts = useMemo(() => {
    if (!mounted || !viewedIds || viewedIds.length === 0 || products.length === 0) {
      return [];
    }

    return viewedIds
      .map((id) => products.find((p) => p.id === id && p.isActive !== false))
      .filter((p): p is Product => !!p);
  }, [mounted, viewedIds, products]);

  // Productos con descuento / oferta
  const dealProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.isActive !== false &&
        ((p.discount && p.discount > 0) ||
          (p.originalPrice && p.originalPrice > p.price))
    );
  }, [products]);

  // Productos para la sección destacada (1 grande en 2 columnas + 3 al lado):
  // Prioriza los que tengan descuento, o los primeros activos para que SIEMPRE se muestre
  const featuredOfferProducts = useMemo(() => {
    const active = products.filter((p) => p.isActive !== false);
    if (dealProducts.length >= 4) {
      return dealProducts.slice(0, 4);
    }
    const nonDeal = active.filter((p) => !dealProducts.some((d) => d.id === p.id));
    return [...dealProducts, ...nonDeal].slice(0, 4);
  }, [dealProducts, products]);

  // 20 productos variados / al azar que SIEMPRE se muestren (para que la tienda nunca esté vacía)
  const random20Products = useMemo(() => {
    const active = products.filter((p) => p.isActive !== false);
    if (active.length === 0) return [];
    // Mezcla aleatoria de productos
    const shuffled = [...active].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 20);
  }, [products]);

  return (
    <div className="pb-16 -mt-[100px]">
      <MainCarousel />

      {/* Sección «Basado en tu última visita»: Se muestra ÚNICAMENTE si hay historial en localStorage */}
      {mounted && recentlyViewedProducts.length > 0 && (
        <ProductCarousel
          title="Basado en tu última visita"
          products={recentlyViewedProducts}
          headerAction={{
            label: 'Ver historial',
            href: '/historial',
          }}
        />
      )}

      {/* Categorías */}
      <CategoryCarousel />

      {/* Ofertas destacadas: 1 producto en 2 columnas + 3 productos al lado */}
      {featuredOfferProducts.length > 0 && (
        <ProductCarousel
          title="Ofertas del día"
          products={featuredOfferProducts}
          variant="featured"
        />
      )}

      {/* Siempre visible: 20 productos variados / al azar para que el nuevo cliente siempre vea catálogo */}
      {random20Products.length > 0 && (
        <ProductCarousel
          title="Descubre nuestros productos"
          products={random20Products}
          scrollable
        />
      )}

      {/* Marcas */}
      <BrandsCarousel />
    </div>
  );
}

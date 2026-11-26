'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { TbChevronRight, TbTrash, TbLoader2 } from 'react-icons/tb';
import { useCartStore } from '@/stores/cart.store';
import { useCompanyStore } from '@/stores/company.store';
import { useProductStore } from '@/stores/product.store';
import { CartItemRow } from './_components/CartItemRow';
import { CartSummary } from './_components/CartSummary';
import { CartEmptyState } from './_components/CartEmptyState';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
  } = useCartStore();

  const { company, fetchCompany } = useCompanyStore();
  const symbol = company?.currencySymbol || 'S/';

  const { products, fetchProducts } = useProductStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCompany();
    fetchProducts();
  }, [fetchCompany, fetchProducts]);

  const totalItems = useMemo(() => getTotalItems(), [items, getTotalItems]);
  const subtotal = useMemo(() => getSubtotal(), [items, getSubtotal]);

  // Saber si al menos un ítem tiene envío gratis
  const hasFreeShipping = useMemo(() => {
    return items.some((item) => item.freeShipping === true);
  }, [items]);

  // Productos recomendados para el estado vacío
  const recommendedProducts = useMemo(() => {
    return products.filter((p) => p.isActive !== false).slice(0, 10);
  }, [products]);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center gap-3">
        <TbLoader2 className="animate-spin text-[#de2a2a]" size={36} />
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Cargando tu carrito...</p>
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
          <span className="text-black font-bold">Carrito</span>
        </nav>

        {items.length === 0 ? (
          <CartEmptyState recommendedProducts={recommendedProducts} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Lista de productos en el carrito */}
            <div className="lg:col-span-8 bg-white rounded-none border border-[#d9d9d9] p-4 sm:p-6">
              <div className="flex items-center justify-between border-b border-[#d9d9d9] pb-4 mb-3">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <h1 className="font-display text-lg sm:text-2xl font-extrabold uppercase tracking-tight text-black">
                    Carrito de compras
                  </h1>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-[#de2a2a] hover:text-red-700 font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <TbTrash size={15} />
                  <span>Vaciar carrito</span>
                </button>
              </div>

              {/* Lista de filas de productos */}
              <div className="divide-y divide-[#d9d9d9]">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    currencySymbol={symbol}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            {/* Columna Derecha: Resumen de compra */}
            <div className="lg:col-span-4">
              <CartSummary
                subtotal={subtotal}
                totalItems={totalItems}
                hasFreeShipping={hasFreeShipping}
                currencySymbol={symbol}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

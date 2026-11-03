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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <TbLoader2 className="animate-spin text-[#3483fa]" size={36} />
        <p className="text-xs text-gray-500">Cargando tu carrito...</p>
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
          <span className="text-gray-800 font-medium">Carrito</span>
        </nav>

        {items.length === 0 ? (
          <CartEmptyState recommendedProducts={recommendedProducts} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Lista de productos en el carrito */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-4 sm:p-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                    Carrito de compras
                  </h1>
                  <span className="text-xs text-gray-500 font-light">
                    ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <TbTrash size={15} />
                  <span>Vaciar carrito</span>
                </button>
              </div>

              {/* Lista de filas de productos */}
              <div className="divide-y divide-gray-100">
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

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TbX,
  TbTrash,
  TbPlus,
  TbMinus,
  TbShoppingBag,
  TbTruckDelivery,
  TbArrowRight,
} from 'react-icons/tb';
import { useCartStore } from '@/stores/cart.store';
import { useCompanyStore } from '@/stores/company.store';

export const MiniCartDrawer = () => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    getTotalItems,
    getSubtotal,
  } = useCartStore();
  const { company } = useCompanyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!mounted || !isDrawerOpen) return null;

  const symbol = company?.currencySymbol || 'S/';
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  const freeShippingThreshold = 99;
  const hasFreeShipping =
    items.some((it) => it.freeShipping) || subtotal >= freeShippingThreshold;
  const missingForFree = Math.max(0, freeShippingThreshold - subtotal);
  const progressPct = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-[1px] transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-md bg-white text-[#020202] h-full flex flex-col shadow-2xl border-l border-[#d9d9d9]">
        {/* Header Principal Oscuro */}
        <div className="bg-brand-primary text-white px-5 py-4 flex items-center justify-between border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <TbShoppingBag size={20} className="text-brand-accent" />
            <h2 className="font-display font-extrabold uppercase text-sm tracking-wider">
              TU CARRITO ({totalItems})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Cerrar carrito"
            className="p-1.5 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <TbX size={20} />
          </button>
        </div>

        {/* Barra de envío gratis */}
        {items.length > 0 && (
          <div className="px-5 py-3 bg-[#f7f7f7] border-b border-[#e5e5e5] space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[#020202]">
              <TbTruckDelivery
                size={16}
                className={hasFreeShipping ? 'text-[#2e9e7b]' : 'text-brand-accent'}
              />
              {hasFreeShipping ? (
                <span>
                  ¡Genial! Tienes <strong className="text-[#2e9e7b]">ENVÍO GRATIS</strong> en este pedido.
                </span>
              ) : (
                <span>
                  Agrega <strong>{symbol} {missingForFree.toFixed(2)}</strong> más para{' '}
                  <strong className="text-brand-accent">ENVÍO GRATIS</strong>.
                </span>
              )}
            </div>
            <div className="w-full h-1.5 bg-[#e5e5e5] overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  hasFreeShipping ? 'bg-[#2e9e7b]' : 'bg-brand-accent'
                }`}
                style={{ width: `${hasFreeShipping ? 100 : progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Lista de Ítems */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#e5e5e5]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-neutral-400">
                <TbShoppingBag size={30} />
              </div>
              <div>
                <p className="font-display font-extrabold uppercase text-base text-black">
                  Tu carrito está vacío
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Explora nuestra selección de vinos, chocolates, cacao y café de origen.
                </p>
              </div>
              <Link
                href="/categories"
                onClick={closeDrawer}
                className="px-6 py-3 bg-brand-accent hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest transition-colors rounded-none"
              >
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-4 flex gap-3.5 items-start">
                <Link
                  href={`/product/${item.slug || item.id}`}
                  onClick={closeDrawer}
                  className="w-20 h-20 bg-[#f8f8f8] border border-[#ececec] flex items-center justify-center p-1.5 shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl || '/placeholder.png'}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/product/${item.slug || item.id}`}
                      onClick={closeDrawer}
                      className="text-xs font-semibold text-[#020202] hover:text-brand-accent line-clamp-2 leading-snug transition-colors"
                    >
                      {item.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Quitar ${item.title}`}
                      className="text-neutral-400 hover:text-brand-accent p-0.5 transition-colors cursor-pointer shrink-0"
                    >
                      <TbTrash size={15} />
                    </button>
                  </div>

                  <p className="text-xs font-bold text-black mt-1">
                    {symbol} {Number(item.price).toFixed(2)}
                  </p>

                  <div className="flex items-center justify-between mt-2.5">
                    <div className="inline-flex items-center border border-[#d9d9d9]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Disminuir cantidad"
                        className="w-7 h-7 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        <TbMinus size={13} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-black">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.stock || 999)}
                        aria-label="Aumentar cantidad"
                        className="w-7 h-7 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <TbPlus size={13} />
                      </button>
                    </div>

                    <span className="text-xs font-extrabold text-black">
                      {symbol} {(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer del Drawer */}
        {items.length > 0 && (
          <div className="p-5 bg-white border-t border-[#d9d9d9] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Subtotal estimado
              </span>
              <span className="text-lg font-extrabold text-black">
                {symbol} {subtotal.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="w-full h-12 bg-brand-accent hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors rounded-none"
              >
                <span>IR A PAGAR</span>
                <TbArrowRight size={16} />
              </Link>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="w-full h-10 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center transition-colors rounded-none"
              >
                VER CARRITO
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

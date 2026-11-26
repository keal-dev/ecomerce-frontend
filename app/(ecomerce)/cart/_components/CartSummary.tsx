'use client';

import React from 'react';
import Link from 'next/link';
import {
  TbShieldCheck,
  TbTruckDelivery,
  TbArrowRight,
  TbLock,
} from 'react-icons/tb';

interface CartSummaryProps {
  subtotal: number;
  totalItems: number;
  hasFreeShipping: boolean;
  currencySymbol: string;
}

export const CartSummary = ({
  subtotal,
  totalItems,
  hasFreeShipping,
  currencySymbol,
}: CartSummaryProps) => {
  // Envío gratis si algún ítem tiene freeShipping o si la compra supera S/ 99
  const isFreeShippingQualified = hasFreeShipping || subtotal >= 99;
  const shippingCost = isFreeShippingQualified ? 0 : 10;
  const total = subtotal + shippingCost;

  return (
    <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-5 sm:p-6 sticky top-24">
      <h2 className="font-display text-base font-extrabold uppercase tracking-tight text-black border-b border-[#d9d9d9] pb-3 mb-4">
        Resumen de compra
      </h2>

      <div className="space-y-3 text-xs sm:text-sm">
        {/* Productos / Subtotal */}
        <div className="flex justify-between text-neutral-600">
          <span>
            Productos ({totalItems} {totalItems === 1 ? 'unidad' : 'unidades'})
          </span>
          <span className="font-bold text-black">
            {currencySymbol} {subtotal.toFixed(2)}
          </span>
        </div>

        {/* Envío */}
        <div className="flex justify-between items-center text-neutral-600">
          <span className="flex items-center gap-1.5">
            <TbTruckDelivery size={16} className="text-[#2e9e7b]" />
            <span>Delivery</span>
          </span>
          {isFreeShippingQualified ? (
            <span className="text-[#2e9e7b] font-bold text-xs uppercase tracking-wider">
              Gratis
            </span>
          ) : (
            <span className="font-bold text-black">
              {currencySymbol} {shippingCost.toFixed(2)}
            </span>
          )}
        </div>

        {/* Barra de progreso para envío gratis si no califica aún */}
        {!isFreeShippingQualified && subtotal < 99 && (
          <div className="p-3 bg-white rounded-none border border-[#d9d9d9] text-[11px] text-[#020202]">
            <span>
              ¡Agrega <strong>{currencySymbol} {(99 - subtotal).toFixed(2)}</strong> más para obtener <strong>Delivery Gratis</strong>!
            </span>
            <div className="w-full bg-neutral-200 h-1.5 rounded-none mt-2 overflow-hidden">
              <div
                className="bg-brand-accent h-full rounded-none transition-all duration-300"
                style={{ width: `${Math.min((subtotal / 99) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Separador */}
        <div className="pt-3 border-t border-[#d9d9d9] flex justify-between items-baseline">
          <span className="text-sm font-bold uppercase tracking-wider text-black">
            Total a pagar
          </span>
          <span className="font-display text-2xl font-extrabold text-black tracking-tight">
            {currencySymbol} {total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Botón principal para realizar pedido */}
      <Link
        href="/checkout"
        className="w-full mt-5 py-3.5 px-4 bg-brand-accent hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-none transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
      >
        <span>Continuar compra</span>
        <TbArrowRight size={16} />
      </Link>

      {/* Garantías y Seguridad */}
      <div className="mt-5 pt-4 border-t border-[#d9d9d9] space-y-2 text-[11px] text-neutral-600">
        <div className="flex items-center gap-2 text-black font-medium">
          <TbShieldCheck size={16} className="text-[#2e9e7b] shrink-0" />
          <span>Productos de origen garantizado con compra protegida</span>
        </div>
        <div className="flex items-center gap-2">
          <TbLock size={15} className="text-neutral-500 shrink-0" />
          <span>Pago seguro encriptado de punta a punta</span>
        </div>
      </div>
    </div>
  );
};

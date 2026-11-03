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
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 sm:p-6 sticky top-20">
      <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
        Resumen de compra
      </h2>

      <div className="space-y-3 text-xs sm:text-sm">
        {/* Productos / Subtotal */}
        <div className="flex justify-between text-gray-600">
          <span>
            Productos ({totalItems} {totalItems === 1 ? 'unidad' : 'unidades'})
          </span>
          <span className="font-semibold text-gray-900">
            {currencySymbol} {subtotal.toFixed(2)}
          </span>
        </div>

        {/* Envío */}
        <div className="flex justify-between items-center text-gray-600">
          <span className="flex items-center gap-1.5">
            <TbTruckDelivery size={16} className="text-[#00a650]" />
            <span>Envío</span>
          </span>
          {isFreeShippingQualified ? (
            <span className="text-[#00a650] font-bold text-xs uppercase">
              Gratis
            </span>
          ) : (
            <span className="font-semibold text-gray-900">
              {currencySymbol} {shippingCost.toFixed(2)}
            </span>
          )}
        </div>

        {/* Barra de progreso para envío gratis si no califica aún */}
        {!isFreeShippingQualified && subtotal < 99 && (
          <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-800">
            <span>
              ¡Agrega <strong>{currencySymbol} {(99 - subtotal).toFixed(2)}</strong> más para obtener <strong>Envío Gratis</strong>!
            </span>
            <div className="w-full bg-blue-200/70 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-[#3483fa] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min((subtotal / 99) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Separador */}
        <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
          <span className="text-sm sm:text-base font-bold text-gray-900">
            Total a pagar
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {currencySymbol} {total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Botón principal para realizar pedido */}
      <Link
        href="/checkout"
        className="w-full mt-5 py-3 px-4 bg-[#3483fa] hover:bg-[#2968c8] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
      >
        <span>Continuar compra</span>
        <TbArrowRight size={16} />
      </Link>

      {/* Garantías y Seguridad */}
      <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-[11px] text-gray-500 font-light">
        <div className="flex items-center gap-2 text-gray-700 font-normal">
          <TbShieldCheck size={16} className="text-[#00a650] shrink-0" />
          <span>Compra Protegida con garantía de devolución</span>
        </div>
        <div className="flex items-center gap-2">
          <TbLock size={15} className="text-gray-400 shrink-0" />
          <span>Pago seguro encriptado de punta a punta</span>
        </div>
      </div>
    </div>
  );
};

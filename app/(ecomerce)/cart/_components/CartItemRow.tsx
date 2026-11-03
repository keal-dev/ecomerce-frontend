'use client';

import React from 'react';
import Link from 'next/link';
import { TbTrash, TbPlus, TbMinus } from 'react-icons/tb';
import { FaBolt } from 'react-icons/fa6';
import { CartItem } from '@/stores/cart.store';

interface CartItemRowProps {
  item: CartItem;
  currencySymbol: string;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export const CartItemRow = ({
  item,
  currencySymbol,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) => {
  const lineTotal = item.price * item.quantity;
  const href = `/product/${item.slug || item.id}`;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors rounded-xl">
      {/* Izquierda: Foto y Datos */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <Link
          href={href}
          className="w-18 h-18 sm:w-20 sm:h-20 bg-white rounded-xl border border-gray-200/80 p-1.5 flex items-center justify-center shrink-0 hover:border-[#3483fa] transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl || '/placeholder.png'}
            alt={item.title}
            className="w-full h-full object-contain"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={href}
            className="text-xs sm:text-sm font-medium text-gray-800 hover:text-[#3483fa] transition-colors line-clamp-2 leading-snug"
          >
            {item.title}
          </Link>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {item.freeShipping && (
              <span className="text-[#00a650] text-[11px] font-semibold">
                Envío gratis
              </span>
            )}
            {item.full && (
              <span className="text-[#00a650] text-[10px] font-bold italic flex items-center">
                <FaBolt size={9} className="mr-0.5" /> FULL
              </span>
            )}
            {item.stock <= 5 && item.stock > 0 && (
              <span className="text-amber-600 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                ¡Solo quedan {item.stock}!
              </span>
            )}
          </div>

          <div className="sm:hidden flex items-baseline gap-2 mt-2">
            <span className="text-sm font-bold text-gray-900">
              {currencySymbol} {lineTotal.toFixed(2)}
            </span>
            <span className="text-[11px] text-gray-400">
              ({currencySymbol} {item.price.toFixed(2)} c/u)
            </span>
          </div>
        </div>
      </div>

      {/* Derecha: Selector de Cantidad, Total y Borrar */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        {/* Controles de Cantidad (+ / -) */}
        <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Disminuir cantidad"
            className="p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
          >
            <TbMinus size={14} />
          </button>

          <span className="w-9 text-center text-xs font-bold text-gray-800 select-none">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            aria-label="Aumentar cantidad"
            className="p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
          >
            <TbPlus size={14} />
          </button>
        </div>

        {/* Total por ítem (en escritorio) */}
        <div className="hidden sm:block text-right min-w-[90px]">
          <span className="text-sm font-bold text-gray-900 block">
            {currencySymbol} {lineTotal.toFixed(2)}
          </span>
          {item.quantity > 1 && (
            <span className="text-[10px] text-gray-400 block font-light">
              {currencySymbol} {item.price.toFixed(2)} c/u
            </span>
          )}
        </div>

        {/* Botón Eliminar */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          title="Eliminar producto"
          aria-label="Eliminar del carrito"
          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <TbTrash size={16} />
        </button>
      </div>
    </div>
  );
};

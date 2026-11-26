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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-[#d9d9d9] last:border-b-0 hover:bg-[#f8f8f8] transition-colors">
      {/* Izquierda: Foto y Datos */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Link
          href={href}
          className="w-20 h-20 bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-1.5 flex items-center justify-center shrink-0 hover:border-black transition-colors"
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
            className="text-xs sm:text-sm font-bold text-black hover:text-[#de2a2a] transition-colors line-clamp-2 leading-snug"
          >
            {item.title}
          </Link>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {item.freeShipping && (
              <span className="text-[#2e9e7b] text-[10px] font-bold uppercase tracking-wider">
                Envío gratis
              </span>
            )}
            {item.full && (
              <span className="text-[#2e9e7b] text-[10px] font-bold italic uppercase tracking-wider flex items-center">
                <FaBolt size={9} className="mr-0.5" /> EXPRESS
              </span>
            )}
            {item.stock <= 5 && item.stock > 0 && (
              <span className="text-black bg-[#f3ff34] text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider">
                ¡Solo quedan {item.stock}!
              </span>
            )}
          </div>

          <div className="sm:hidden flex items-baseline gap-2 mt-2">
            <span className="text-sm font-extrabold text-black">
              {currencySymbol} {lineTotal.toFixed(2)}
            </span>
            <span className="text-[11px] text-neutral-500">
              ({currencySymbol} {item.price.toFixed(2)} c/u)
            </span>
          </div>
        </div>
      </div>

      {/* Derecha: Selector de Cantidad, Total y Borrar */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#d9d9d9]">
        {/* Controles de Cantidad (+ / -) */}
        <div className="flex items-center border border-[#d9d9d9] rounded-none bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Disminuir cantidad"
            className="p-2 text-black hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
          >
            <TbMinus size={14} />
          </button>

          <span className="w-9 text-center text-xs font-bold text-black select-none">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            aria-label="Aumentar cantidad"
            className="p-2 text-black hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
          >
            <TbPlus size={14} />
          </button>
        </div>

        {/* Total por ítem (en escritorio) */}
        <div className="hidden sm:block text-right min-w-[95px]">
          <span className="text-sm font-extrabold text-black block">
            {currencySymbol} {lineTotal.toFixed(2)}
          </span>
          {item.quantity > 1 && (
            <span className="text-[10px] text-neutral-500 block">
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
          className="p-2 text-neutral-400 hover:text-[#de2a2a] border border-transparent hover:border-[#de2a2a] rounded-none transition-colors cursor-pointer"
        >
          <TbTrash size={16} />
        </button>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TbShoppingCart,
  TbSearch,
  TbTrash,
  TbPlus,
  TbMinus,
  TbReceipt,
  TbCash,
  TbCreditCard,
  TbQrcode,
  TbUser,
  TbDeviceDesktopAnalytics,
  TbBuildingStore,
} from 'react-icons/tb';
import { useProductStore } from '@/stores/product.store';
import { useCompanyStore } from '@/stores/company.store';
import { Product } from '@/types/product.types';

interface CartItem {
  product: Product;
  quantity: number;
}

export function SalesManager() {
  const { products, fetchProducts } = useProductStore();
  const { company } = useCompanyStore();

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [docType, setDocType] = useState<'boleta' | 'factura' | 'nota'>('boleta');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'pos' | 'yape'>('efectivo');

  const symbol = company?.currencySymbol || 'S/';

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0);

  const filteredProducts = products.filter(
    (p) =>
      p.isActive !== false &&
      (p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TbDeviceDesktopAnalytics size={22} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Punto de Venta (POS) — Tienda Física
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Registro de ventas de mostrador, cobro inmediato y emisión de comprobantes en caja.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#3483fa] text-xs font-semibold transition-colors"
          >
            Ver Pedidos Online (Web)
          </Link>
        </div>
      </div>

      {/* Grid: Catálogo para agregar (izq) y Carrito de mostrador (der) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Izquierda: Buscador y Productos de tienda */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
          <div className="relative">
            <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o código de barras / SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addToCart(p)}
                className="p-3 bg-gray-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 border border-gray-100 rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="w-full h-20 bg-white rounded-lg border border-gray-100 p-1 flex items-center justify-center overflow-hidden mb-2">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-contain" />
                  ) : (
                    <TbBuildingStore size={24} className="text-gray-300" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-emerald-700">
                    {p.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Stock: {p.stock}</p>
                </div>
                <div className="mt-2 text-xs font-bold text-gray-900 group-hover:text-emerald-600">
                  {symbol} {Number(p.price).toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Derecha: Caja de Cobro */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <TbShoppingCart className="text-emerald-600" size={18} />
              <span>Venta en Caja ({cart.length})</span>
            </h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Lista de productos en mostrador */}
          <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                Selecciona productos del catálogo para iniciar la venta.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="pt-2 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.product.title}</p>
                    <p className="text-gray-400 text-[11px]">
                      {symbol} {Number(item.product.price).toFixed(2)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                    >
                      <TbMinus size={12} />
                    </button>
                    <span className="font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                    >
                      <TbPlus size={12} />
                    </button>
                  </div>
                  <div className="font-bold text-gray-900 shrink-0 w-16 text-right">
                    {symbol} {(Number(item.product.price) * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-gray-300 hover:text-red-500 cursor-pointer p-1"
                  >
                    <TbTrash size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Comprobante a emitir */}
          <div className="pt-3 border-t border-gray-100">
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">
              Tipo de Comprobante
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['boleta', 'factura', 'nota'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDocType(t)}
                  className={`py-1.5 rounded-lg border font-medium capitalize transition-all cursor-pointer ${
                    docType === t
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Método de pago en caja */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
                className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'efectivo'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <TbCash size={18} />
                <span className="text-[11px] font-medium">Efectivo</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('pos')}
                className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'pos'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <TbCreditCard size={18} />
                <span className="text-[11px] font-medium">Tarjeta POS</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('yape')}
                className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'yape'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <TbQrcode size={18} />
                <span className="text-[11px] font-medium">Yape / Plin</span>
              </button>
            </div>
          </div>

          {/* Total y Botón de Cobrar */}
          <div className="pt-3 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-gray-600 uppercase">Total a Cobrar:</span>
              <span className="text-2xl font-black text-gray-900">
                {symbol} {subtotal.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              disabled={cart.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <TbReceipt size={18} />
              <span>Cobrar e Imprimir Ticket ({symbol} {subtotal.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


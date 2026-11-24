'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  TbCheck,
  TbAlertCircle,
  TbPrinter,
  TbFileInvoice,
  TbDownload,
  TbRefresh,
  TbX,
  TbHistory,
  TbPackage,
} from 'react-icons/tb';
import { useProductStore } from '@/stores/product.store';
import { useCompanyStore } from '@/stores/company.store';
import { useCategoryStore } from '@/stores/category.store';
import { createOrder, emitOrderInvoice, getOrders } from '@/services/order.service';
import { getCurrentCashSession } from '@/services/cash-register.service';
import { Product } from '@/types/product.types';
import { Order } from '@/types/order.types';
import { CashSession } from '@/types/cash-register.types';

interface CartItem {
  product: Product;
  quantity: number;
}

export function SalesManager() {
  const { products, fetchProducts, isLoading: loadingProducts } = useProductStore();
  const { company } = useCompanyStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Tipo de comprobante y método de pago
  const [docType, setDocType] = useState<'boleta' | 'factura' | 'nota'>('boleta');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'pos' | 'yape'>('efectivo');

  // Datos del cliente en mostrador
  const [customerDoc, setCustomerDoc] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [cashReceived, setCashReceived] = useState('');

  // Estados de procesamiento y resultado
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedSale, setCompletedSale] = useState<{
    order: Order;
    changeAmount: number;
    cashGiven: number;
  } | null>(null);

  // Estado de caja e historial POS
  const [cashSession, setCashSession] = useState<CashSession | null>(null);
  const [posOrders, setPosOrders] = useState<Order[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const symbol = company?.currencySymbol || 'S/';

  const loadAuxData = useCallback(async () => {
    try {
      const [sessionData, allOrders] = await Promise.all([
        getCurrentCashSession().catch(() => null),
        getOrders().catch(() => []),
      ]);
      setCashSession(sessionData);
      // Filtrar ventas realizadas en POS (cuyo orderNumber empieza con POS- o paymentMethod incluye POS)
      const counterSales = allOrders.filter(
        (o) =>
          o.orderNumber.toUpperCase().startsWith('POS-') ||
          (o.paymentMethod || '').toUpperCase().includes('POS'),
      );
      setPosOrders(counterSales);
    } catch (e) {
      console.error('Error cargando datos auxiliares POS:', e);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    loadAuxData();
  }, [fetchProducts, fetchCategories, loadAuxData]);

  // Limpiar documento cuando cambia entre boleta/factura/nota
  const handleSelectDocType = (type: 'boleta' | 'factura' | 'nota') => {
    setDocType(type);
    setErrorMessage(null);
    setCustomerDoc('');
  };

  const handleCustomerDocChange = (val: string) => {
    const maxLen = docType === 'factura' ? 11 : 8;
    const digits = val.replace(/\D/g, '').slice(0, maxLen);
    setCustomerDoc(digits);
  };

  const addToCart = (product: Product) => {
    setErrorMessage(null);
    const availableStock = Number(product.stock) || 0;
    if (availableStock <= 0) {
      setErrorMessage(`El producto "${product.title}" está agotado en almacén.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= availableStock) {
          setErrorMessage(
            `Stock máximo alcanzado para "${product.title}" (${availableStock} disponibles).`,
          );
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setErrorMessage(null);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const availableStock = Number(item.product.stock) || 0;
            const newQty = item.quantity + delta;
            if (newQty > availableStock) {
              setErrorMessage(
                `Solo hay ${availableStock} unidades en stock de "${item.product.title}".`,
              );
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null),
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const clearPosForm = () => {
    setCart([]);
    setCustomerDoc('');
    setCustomerName('');
    setCashReceived('');
    setErrorMessage(null);
    setIsCheckoutModalOpen(false);
  };

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0),
    [cart],
  );

  // Cálculo de vuelto si paga en efectivo
  const numericCashReceived = parseFloat(cashReceived) || 0;
  const changeAmount =
    paymentMethod === 'efectivo' && numericCashReceived > subtotal
      ? Number((numericCashReceived - subtotal).toFixed(2))
      : 0;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.isActive === false) return false;
      if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchSku = (p.sku || '').toLowerCase().includes(q);
        return matchTitle || matchSku;
      }
      return true;
    });
  }, [products, selectedCategory, search]);

  // Procesar el cobro en mostrador
  const handleProcessPosSale = async () => {
    if (cart.length === 0) return;
    setErrorMessage(null);

    // Validaciones según tipo de comprobante
    if (docType === 'factura') {
      if (!/^\d{11}$/.test(customerDoc.trim())) {
        setErrorMessage('Para emitir Factura debes ingresar un RUC válido de 11 dígitos.');
        return;
      }
      if (!customerName.trim()) {
        setErrorMessage('Para emitir Factura debes ingresar la Razón Social de la empresa.');
        return;
      }
    } else if (docType === 'boleta' && customerDoc.trim() !== '') {
      if (!/^\d{8}$/.test(customerDoc.trim())) {
        setErrorMessage('El DNI debe tener 8 dígitos (o déjalo en blanco para Clientes Varios).');
        return;
      }
    }

    if (
      paymentMethod === 'efectivo' &&
      cashReceived.trim() !== '' &&
      numericCashReceived < subtotal
    ) {
      setErrorMessage(
        `El monto recibido (${symbol} ${numericCashReceived.toFixed(2)}) es menor al total a cobrar (${symbol} ${subtotal.toFixed(2)}).`,
      );
      return;
    }

    setIsProcessing(true);
    try {
      const year = new Date().getFullYear();
      const posOrderNumber = `POS-${year}-${Math.floor(10000 + Math.random() * 90000)}`;

      const finalDocType = docType === 'factura' ? 'RUC' : 'DNI';
      const finalDocNumber =
        docType === 'factura'
          ? customerDoc.trim()
          : customerDoc.trim() || '00000000';
      const finalCustomerName =
        customerName.trim() ||
        (docType === 'factura' ? 'EMPRESA CLIENTE' : 'CLIENTES VARIOS');

      const paymentLabel =
        paymentMethod === 'efectivo'
          ? 'POS - Efectivo'
          : paymentMethod === 'pos'
          ? 'POS - Tarjeta'
          : 'POS - Yape / Plin';

      // 1. Crear la orden en PostgreSQL (descuenta stock y actualiza caja abierta automáticamente)
      let savedOrder = await createOrder({
        orderNumber: posOrderNumber,
        customerName: finalCustomerName,
        customerEmail: company?.email || 'ventas@mostrador.local',
        customerPhone: company?.phone || '000000000',
        docType: finalDocType,
        docNumber: finalDocNumber,
        department: 'Lima',
        province: 'Lima',
        district: 'Lima',
        address: company?.address || 'Venta en Tienda Física (Mostrador)',
        reference: 'Entregado en mostrador POS',
        subtotal,
        shippingCost: 0,
        total: subtotal,
        currencySymbol: symbol,
        paymentMethod: paymentLabel,
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        invoiceType: docType === 'nota' ? undefined : docType,
        companyRuc: docType === 'factura' ? finalDocNumber : undefined,
        companyLegalName: docType === 'factura' ? finalCustomerName : undefined,
        notes: `Venta POS en mostrador (${paymentLabel})`,
        items: cart.map((item) => ({
          productId: item.product.id,
          title: item.product.title,
          sku: item.product.sku || undefined,
          imageUrl: item.product.imageUrl,
          quantity: item.quantity,
          price: Number(item.product.price),
        })),
      });

      // 2. Si seleccionó Boleta o Factura, emitir automáticamente el comprobante electrónico en Facturalo.pe
      if (docType === 'boleta' || docType === 'factura') {
        try {
          savedOrder = await emitOrderInvoice(savedOrder.id);
        } catch (invErr: any) {
          console.error('Error al emitir comprobante POS en Facturalo:', invErr);
        }
      }

      // 3. Mostrar modal de éxito con el ticket listo para imprimir
      setCompletedSale({
        order: savedOrder,
        cashGiven: numericCashReceived > 0 ? numericCashReceived : subtotal,
        changeAmount,
      });

      // 4. Limpiar carrito y refrescar productos y caja
      clearPosForm();
      fetchProducts();
      loadAuxData();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Ocurrió un error al registrar la venta en el POS.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Obtener enlace de Ticket 80mm a partir del enlace PDF de Facturalo
  const getTicket80mmUrl = (pdfUrl?: string | null) => {
    if (!pdfUrl) return null;
    if (pdfUrl.endsWith('.pdf') && !pdfUrl.endsWith('.ticket.pdf')) {
      return pdfUrl.replace(/\.pdf$/, '.ticket.pdf');
    }
    return pdfUrl;
  };

  return (
    <div className="space-y-5">
      {/* Encabezado Principal + Estado de Caja */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200/60">
              <TbDeviceDesktopAnalytics size={22} />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Punto de Venta (POS) — Tienda Física
              </h1>
              <p className="text-xs text-gray-500">
                Cobro inmediato en mostrador, descuento automático de stock y emisión de Boletas/Facturas SUNAT.
              </p>
            </div>
          </div>
        </div>

        {/* Estado de Caja e Historial */}
        <div className="flex flex-wrap items-center gap-2.5">
          {cashSession ? (
            <Link
              href="/admin/settings/cash-register"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
              title="Ir a Arqueo y Cierre de Caja"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Caja Abierta: {symbol} {Number(cashSession.expectedAmount).toFixed(2)}
              </span>
            </Link>
          ) : (
            <Link
              href="/admin/settings/cash-register"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
            >
              <TbAlertCircle size={15} className="text-amber-600" />
              <span>Caja Cerrada (Abrir Turno)</span>
            </Link>
          )}

          <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('pos')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'pos'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TbShoppingCart size={15} />
              <span>Terminal Mostrador</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('history');
                loadAuxData();
              }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TbHistory size={15} />
              <span>Ventas en Caja ({posOrders.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* PESTAÑA 1: TERMINAL DE VENTAS EN MOSTRADOR */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Izquierda (7 cols): Catálogo de Productos Rápido */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 sm:p-5 space-y-4">
            {/* Buscador + Categorías */}
            <div className="space-y-3">
              <div className="relative">
                <TbSearch
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Escanear código de barras, SKU o buscar producto por nombre..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              {/* Chips de Categorías */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    selectedCategory === 'ALL'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todos ({products.filter((p) => p.isActive !== false).length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Grilla de Productos */}
            {loadingProducts && products.length === 0 ? (
              <div className="py-16 text-center text-xs text-gray-400">
                Cargando catálogo de productos...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-14 text-center space-y-2">
                <TbPackage className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs font-semibold text-gray-600">
                  No se encontraron productos disponibles
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredProducts.map((product) => {
                  const stock = Number(product.stock) || 0;
                  const inCartQty =
                    cart.find((c) => c.product.id === product.id)?.quantity || 0;
                  const isOutOfStock = stock <= 0;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product)}
                      className={`group text-left p-3 rounded-xl border transition-all flex flex-col justify-between relative ${
                        isOutOfStock
                          ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                          : inCartQty > 0
                          ? 'bg-emerald-50/40 border-emerald-400 ring-2 ring-emerald-500/10 cursor-pointer'
                          : 'bg-white border-gray-200/90 hover:border-emerald-500 hover:shadow-sm cursor-pointer'
                      }`}
                    >
                      {inCartQty > 0 && (
                        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shadow-xs z-10">
                          {inCartQty}
                        </span>
                      )}

                      <div>
                        <div className="w-full h-24 bg-gray-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden p-1">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <TbPackage size={24} className="text-gray-300" />
                          )}
                        </div>
                        <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                          {product.title}
                        </p>
                        {product.sku && (
                          <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                            SKU: {product.sku}
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-black text-emerald-700">
                          {symbol} {Number(product.price).toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-700'
                              : stock <= 5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isOutOfStock ? 'Agotado' : `Stock: ${stock}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Derecha (5 cols): Carrito / Detalle de Productos en el Pedido */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 sm:p-5 flex flex-col justify-between sticky top-4">
            <div className="space-y-4">
              {/* Encabezado del Carrito */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <TbShoppingCart size={18} />
                  </span>
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm">
                      Detalle de Productos
                    </h2>
                    <p className="text-[11px] text-gray-400">
                      {cart.reduce((acc, i) => acc + i.quantity, 0)} unidades agregadas al pedido
                    </p>
                  </div>
                </div>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearPosForm}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                  >
                    Vaciar lista
                  </button>
                )}
              </div>

              {errorMessage && !isCheckoutModalOpen && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-start gap-2">
                  <TbAlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Lista amplia de Ítems en el Carrito */}
              <div className="space-y-2.5 max-h-[390px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto">
                      <TbShoppingCart size={26} className="text-gray-300" />
                    </div>
                    <p className="text-xs font-semibold text-gray-600">
                      El carrito de venta está vacío
                    </p>
                    <p className="text-[11px] max-w-xs mx-auto">
                      Selecciona productos del catálogo izquierdo para armar el pedido del cliente.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-gray-50/80 border border-gray-200/70 hover:border-gray-300 transition-colors text-xs"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.title}
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : (
                          <TbPackage className="text-gray-300" size={18} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 truncate">{item.product.title}</p>
                        <p className="text-[11px] text-gray-500">
                          {symbol} {Number(item.product.price).toFixed(2)} c/u
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-1 py-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
                        >
                          <TbMinus size={12} />
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
                        >
                          <TbPlus size={12} />
                        </button>
                      </div>

                      <div className="font-bold text-gray-900 shrink-0 w-16 text-right">
                        {symbol} {(Number(item.product.price) * item.quantity).toFixed(2)}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        className="text-gray-400 hover:text-rose-600 cursor-pointer p-1"
                        title="Quitar producto"
                      >
                        <TbTrash size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pie de Resumen e Ir a Cobrar */}
            <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50/80 p-3 rounded-xl border border-gray-200/60">
                <div className="flex justify-between">
                  <span>Op. Gravada (Sin IGV):</span>
                  <span className="font-semibold text-gray-800">
                    {symbol} {(subtotal / 1.18).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>IGV (18%):</span>
                  <span className="font-semibold text-gray-800">
                    {symbol} {(subtotal - subtotal / 1.18).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-200/80">
                  <span className="text-xs font-bold text-gray-900 uppercase">
                    Total del Pedido:
                  </span>
                  <span className="text-2xl font-black text-emerald-700">
                    {symbol} {subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => {
                  setErrorMessage(null);
                  setIsCheckoutModalOpen(true);
                }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <TbReceipt size={19} />
                <span>
                  Ir a Cobrar ({symbol} {subtotal.toFixed(2)})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: HISTORIAL DE VENTAS EN CAJA (POS) */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                Ventas Registradas en Mostrador (POS)
              </h2>
              <p className="text-xs text-gray-500">
                Historial de cobros en tienda física y reimpresión de tickets térmicos o PDF.
              </p>
            </div>
            <button
              type="button"
              onClick={loadAuxData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer"
            >
              <TbRefresh size={14} />
              <span>Actualizar</span>
            </button>
          </div>

          {posOrders.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <TbReceipt className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-semibold text-gray-700">
                Aún no hay ventas registradas desde el terminal POS
              </p>
              <p className="text-xs text-gray-400">
                Las ventas que cobres en mostrador aparecerán aquí con su ticket descargable.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">N° Operación</th>
                    <th className="py-3 px-4">Fecha / Hora</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Pago</th>
                    <th className="py-3 px-4">Comprobante SUNAT</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4 text-right">Imprimir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posOrders.map((ord) => {
                    const ticketUrl = getTicket80mmUrl(ord.invoicePdfUrl);
                    return (
                      <tr key={ord.id} className="hover:bg-gray-50/70">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(ord.createdAt).toLocaleString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900">
                            {ord.companyLegalName || ord.customerName}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {ord.docType}: {ord.companyRuc || ord.docNumber}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-700">
                          {ord.paymentMethod}
                        </td>
                        <td className="py-3.5 px-4">
                          {ord.invoicePdfUrl ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                              <TbFileInvoice size={13} />
                              {ord.invoiceSeries}-{ord.invoiceNumber}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">
                              Nota interna
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-black text-gray-900">
                          {ord.currencySymbol || symbol} {Number(ord.total).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {ord.invoicePdfUrl ? (
                            <div className="inline-flex items-center gap-1.5">
                              {ticketUrl && (
                                <a
                                  href={ticketUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                                  title="Imprimir en formato Ticket Térmico 80mm"
                                >
                                  <TbPrinter size={13} />
                                  <span>Ticket 80mm</span>
                                </a>
                              )}
                              <a
                                href={ord.invoicePdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-[11px] transition-colors"
                                title="Ver PDF A4"
                              >
                                <TbDownload size={13} />
                                <span>A4</span>
                              </a>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400">Sin PDF</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL PASO 2: COBRO EN CAJA Y COMPROBANTE ELECTRÓNICO SUNAT */}
      {isCheckoutModalOpen && cart.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
            {/* Encabezado limpio y profesional */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Finalizar Cobro
                </h3>
                <p className="text-xs text-gray-500">
                  {cart.reduce((acc, i) => acc + i.quantity, 0)} unidades • Incluye 18% IGV
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                    Total a Pagar
                  </span>
                  <span className="text-lg font-black text-gray-900">
                    {symbol} {subtotal.toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <TbX size={18} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-start gap-2">
                  <TbAlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* SECCIÓN 1: COMPROBANTE Y DATOS DEL CLIENTE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    1. Tipo de Comprobante
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Emisión electrónica SUNAT
                  </span>
                </div>

                {/* Selector segmentado neutro */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl text-xs">
                  {(
                    [
                      { id: 'boleta', label: `Boleta (${company?.boletaSeries || 'B001'})` },
                      { id: 'factura', label: `Factura (${company?.facturaSeries || 'F001'})` },
                      { id: 'nota', label: 'Nota Interna' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectDocType(t.id)}
                      className={`py-2 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                        docType === t.id
                          ? 'bg-white text-gray-900 shadow-2xs border border-gray-200/80'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Campos de DNI / RUC y Nombre / Razón Social */}
                <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                      <TbUser size={14} className="text-gray-400" />
                      <span>
                        {docType === 'factura'
                          ? 'Datos de Empresa (Obligatorio)'
                          : 'Datos del Cliente (Opcional)'}
                      </span>
                    </span>
                    {docType === 'boleta' && !customerDoc && (
                      <span className="text-[11px] text-gray-400">
                        Por defecto: Clientes Varios
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    {docType !== 'nota' && (
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={customerDoc}
                          onChange={(e) => handleCustomerDocChange(e.target.value)}
                          placeholder={
                            docType === 'factura' ? 'RUC (11 dígitos)' : 'DNI (8 dígitos)'
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-900 focus:outline-none focus:border-gray-900"
                        />
                      </div>
                    )}

                    <div className={docType !== 'nota' ? 'sm:col-span-7' : 'sm:col-span-12'}>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={
                          docType === 'factura'
                            ? 'Razón Social de la empresa'
                            : 'Nombre del cliente (o Clientes Varios)'
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: MÉTODO DE PAGO */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  2. Método de Pago
                </label>

                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  {(
                    [
                      { id: 'efectivo', label: 'Efectivo', icon: TbCash },
                      { id: 'pos', label: 'Tarjeta POS', icon: TbCreditCard },
                      { id: 'yape', label: 'Yape / Plin', icon: TbQrcode },
                    ] as const
                  ).map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-gray-900 bg-gray-900 text-white font-semibold shadow-2xs'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={20} className={isSelected ? 'text-white' : 'text-gray-400'} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Calculadora de Efectivo y Billetes Rápidos */}
                {paymentMethod === 'efectivo' && (
                  <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-xl space-y-3 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-medium text-gray-500 mr-1">
                        Importe rápido:
                      </span>
                      <button
                        type="button"
                        onClick={() => setCashReceived(subtotal.toFixed(2))}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 font-semibold text-[11px] cursor-pointer"
                      >
                        Exacto ({symbol} {subtotal.toFixed(2)})
                      </button>
                      {[10, 20, 50, 100, 200]
                        .filter((bill) => bill >= subtotal)
                        .map((bill) => (
                          <button
                            key={bill}
                            type="button"
                            onClick={() => setCashReceived(String(bill))}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 font-semibold text-[11px] cursor-pointer"
                          >
                            {symbol} {bill}
                          </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-600 mb-1">
                          Efectivo recibido ({symbol})
                        </label>
                        <input
                          type="number"
                          step="0.10"
                          min="0"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          placeholder={subtotal.toFixed(2)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-bold text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                        />
                      </div>
                      <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex flex-col justify-center items-end">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase">
                          Vuelto a entregar
                        </span>
                        <span className="text-base font-black text-emerald-700">
                          {symbol} {changeAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones Finales del Modal */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProcessPosSale}
                  className="w-full sm:flex-1 py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <TbRefresh size={17} className="animate-spin" />
                      <span>Procesando cobro...</span>
                    </>
                  ) : (
                    <>
                      <TbCheck size={17} />
                      <span>
                        Confirmar y Emitir{' '}
                        {docType === 'factura'
                          ? 'Factura'
                          : docType === 'boleta'
                            ? 'Boleta'
                            : 'Ticket'}{' '}
                        ({symbol} {subtotal.toFixed(2)})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VENTA POS COMPLETADA E IMPRESIÓN DE TICKET */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 p-6 text-center space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <TbCheck size={30} />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
                ¡Cobro Registrado en Caja!
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-0.5">
                {completedSale.order.invoiceSeries
                  ? `${completedSale.order.invoiceType === 'factura' ? 'Factura' : 'Boleta'} ${completedSale.order.invoiceSeries}-${completedSale.order.invoiceNumber}`
                  : `Operación #${completedSale.order.orderNumber}`}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Stock descontado de almacén y comprobante procesado exitosamente.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-500">Cliente:</span>
                <span className="font-bold text-gray-900">
                  {completedSale.order.companyLegalName || completedSale.order.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Documento:</span>
                <span className="font-mono font-semibold text-gray-800">
                  {completedSale.order.docType}:{' '}
                  {completedSale.order.companyRuc || completedSale.order.docNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Método de Pago:</span>
                <span className="font-semibold text-gray-800">
                  {completedSale.order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 text-sm">
                <span className="font-bold text-gray-900">Total Cobrado:</span>
                <span className="font-black text-emerald-700">
                  {symbol} {Number(completedSale.order.total).toFixed(2)}
                </span>
              </div>
              {completedSale.changeAmount > 0 && (
                <div className="flex justify-between text-xs text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                  <span className="font-bold">Vuelto a entregar:</span>
                  <span className="font-black">
                    {symbol} {completedSale.changeAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Botones de Impresión de Ticket / PDF */}
            {completedSale.order.invoicePdfUrl && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={getTicket80mmUrl(completedSale.order.invoicePdfUrl) || completedSale.order.invoicePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <TbPrinter size={17} />
                  <span>Imprimir Ticket 80mm</span>
                </a>
                <a
                  href={completedSale.order.invoicePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
                >
                  <TbFileInvoice size={17} />
                  <span>Descargar PDF A4</span>
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCompletedSale(null)}
              className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cerrar y Atender Siguiente Cliente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  TbTruckDelivery,
  TbPackage,
  TbCheck,
  TbSearch,
  TbAlertCircle,
  TbMapPin,
  TbChevronRight,
  TbArrowLeft,
  TbHelpCircle,
  TbRefresh,
  TbFileInvoice,
} from 'react-icons/tb';
import { trackOrder } from '@/services/order.service';
import { Order, OrderStatus } from '@/types/order.types';
import { useCompanyStore } from '@/stores/company.store';

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialOrderParam = searchParams.get('order') || searchParams.get('id') || '';

  const { company } = useCompanyStore();
  const [orderQuery, setOrderQuery] = useState(initialOrderParam);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<{ orderNumber: string; total: number }[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('my_saved_orders');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRecentOrders(parsed.slice(0, 4));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchTracking = async (orderIdToSearch: string) => {
    if (!orderIdToSearch.trim()) {
      setError('Por favor ingresa un número de pedido (ej: ORD-2026-12345).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await trackOrder(orderIdToSearch.trim());
      setOrder(data);
    } catch (err: any) {
      setOrder(null);
      setError(
        err.response?.status === 404
          ? `No encontramos ningún pedido con el número "${orderIdToSearch}". Por favor verifica el código enviado a tu correo.`
          : 'Ocurrió un error al consultar el estado de tu pedido. Por favor intenta nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderParam) {
      fetchTracking(initialOrderParam);
    }
  }, [initialOrderParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderQuery);
  };

  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'preparing':
        return 2;
      case 'shipping':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return -1;
      case 'pending':
      default:
        return 1;
    }
  };

  const currentStep = order ? getStepProgress(order.orderStatus) : 0;
  const isCancelled = order?.orderStatus === 'cancelled';

  return (
    <div className="min-h-screen bg-white pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-500 mb-6">
          <Link href="/" className="hover:text-[#de2a2a] transition-colors flex items-center gap-1">
            <TbArrowLeft size={13} />
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-neutral-400" />
          <span className="text-black font-bold">Rastreo de Pedidos</span>
        </nav>

        {/* Hero Card */}
        <div className="bg-black text-white rounded-none border-b-4 border-[#de2a2a] p-6 sm:p-10 mb-8 text-center">
          <div className="inline-flex p-3 bg-[#de2a2a] text-white rounded-none mb-4">
            <TbTruckDelivery size={32} />
          </div>
          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#de2a2a] mb-1">
            Seguimiento en vivo
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            ¿Dónde está tu pedido?
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto mt-2 leading-relaxed">
            Rastrea el estado en tiempo real de tu delivery realizado en nuestra tienda online.
          </p>

          {/* Formulario de búsqueda */}
          <form onSubmit={handleSubmit} className="mt-6 max-w-md mx-auto flex gap-2">
            <div className="relative flex-1">
              <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Ej: ORD-2026-48912"
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#262626] rounded-none text-xs sm:text-sm font-bold text-black outline-none placeholder:text-neutral-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-[#de2a2a] hover:bg-red-700 disabled:bg-neutral-600 text-white text-xs font-bold uppercase tracking-widest rounded-none transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {loading ? (
                <TbRefresh className="animate-spin" size={18} />
              ) : (
                <>
                  <TbSearch size={16} />
                  <span>Rastrear</span>
                </>
              )}
            </button>
          </form>

          {/* Compras recientes en este dispositivo */}
          {recentOrders.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <span className="text-neutral-400 font-medium">Compras recientes:</span>
              {recentOrders.map((ro) => (
                <button
                  key={ro.orderNumber}
                  type="button"
                  onClick={() => {
                    setOrderQuery(ro.orderNumber);
                    fetchTracking(ro.orderNumber);
                  }}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-[#de2a2a] border border-[#262626] hover:border-[#de2a2a] text-white rounded-none font-mono text-[11px] font-bold transition-colors cursor-pointer"
                >
                  {ro.orderNumber}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 text-xs text-neutral-400">
            ¿No tienes a la mano tu número de pedido?{' '}
            <Link href="/mis-compras" className="text-[#de2a2a] font-bold hover:underline">
              Búscalo en Mis Compras
            </Link>
            {' '}con tu cuenta o correo.
          </div>

          {error && (
            <div className="mt-4 max-w-md mx-auto p-3.5 bg-red-950/80 border border-[#de2a2a] rounded-none text-white text-xs font-medium flex items-center gap-2 text-left">
              <TbAlertCircle size={18} className="text-[#de2a2a] shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* RESULTADO DEL PEDIDO */}
        {order && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header del pedido */}
            <div className="bg-white rounded-none border border-[#d9d9d9] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#d9d9d9] pb-4">
                <div>
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Número de Seguimiento
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xl font-extrabold text-black">
                      #{order.orderNumber}
                    </span>
                    {order.environment === 'test' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-[#f3ff34] text-black border border-black uppercase">
                        TEST
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs sm:text-right text-neutral-500">
                  <span className="block">Fecha de Compra:</span>
                  <strong className="text-black font-bold">
                    {new Date(order.createdAt).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>
                </div>
              </div>

              {/* TIMELINE / LÍNEA DE TIEMPO DE ESTADOS */}
              {isCancelled ? (
                <div className="mt-6 p-4 bg-red-50 rounded-none border border-[#de2a2a] text-[#de2a2a] text-xs flex items-center gap-3">
                  <TbAlertCircle size={22} className="shrink-0" />
                  <div>
                    <strong className="font-bold uppercase block text-sm">Pedido Cancelado</strong>
                    <p className="mt-0.5 text-neutral-700">
                      Este pedido fue cancelado. Si tienes consultas sobre reembolsos, contáctate con nuestro canal de atención.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                    {[
                      {
                        step: 1,
                        label: 'Pedido Confirmado',
                        desc: 'Pago recibido con éxito',
                        icon: TbCheck,
                      },
                      {
                        step: 2,
                        label: 'En Preparación',
                        desc: 'Empacando tu pedido',
                        icon: TbPackage,
                      },
                      {
                        step: 3,
                        label: 'En Camino',
                        desc: 'Con motorizado asignado',
                        icon: TbTruckDelivery,
                      },
                      {
                        step: 4,
                        label: 'Entregado',
                        desc: 'Recibido en destino',
                        icon: TbCheck,
                      },
                    ].map((st) => {
                      const isCompleted = currentStep >= st.step;
                      const isCurrent = currentStep === st.step;
                      const IconComponent = st.icon;

                      return (
                        <div
                          key={st.step}
                          className={`p-4 rounded-none border transition-all ${
                            isCurrent
                              ? 'bg-red-50/50 border-[#de2a2a]'
                              : isCompleted
                                ? 'bg-[#2e9e7b]/5 border-[#2e9e7b]'
                                : 'bg-[#f8f8f8] border-[#d9d9d9] opacity-60'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-none flex items-center justify-center mb-2.5 ${
                              isCurrent
                                ? 'bg-[#de2a2a] text-white'
                                : isCompleted
                                  ? 'bg-[#2e9e7b] text-white'
                                  : 'bg-neutral-200 text-neutral-500'
                            }`}
                          >
                            <IconComponent size={18} />
                          </div>
                          <h4 className="font-display text-xs font-extrabold uppercase text-black">
                            {st.label}
                          </h4>
                          <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
                            {st.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* DETALLES DE ENTREGA Y PRODUCTOS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Productos comprados */}
              <div className="md:col-span-7 bg-white rounded-none border border-[#d9d9d9] p-5 space-y-3">
                <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-black flex items-center gap-1.5 border-b border-[#d9d9d9] pb-2.5">
                  <TbPackage className="text-[#de2a2a]" size={16} />
                  <span>Artículos en tu compra ({order.items?.length || 0})</span>
                </h3>

                <div className="divide-y divide-[#d9d9d9]">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {item.productImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.productImageUrl}
                            alt={item.productTitle}
                            className="w-12 h-12 object-contain rounded-none border border-[#d9d9d9] bg-[#f8f8f8] p-1"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[#f8f8f8] border border-[#d9d9d9] rounded-none flex items-center justify-center text-neutral-400">
                            <TbPackage size={20} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-black">{item.productTitle}</p>
                          <p className="text-neutral-500 text-[11px]">
                            {item.quantity} x S/ {Number(item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="font-extrabold text-black">
                        S/ {Number(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#d9d9d9] flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-bold uppercase">Total de la orden:</span>
                  <span className="font-display text-lg font-extrabold text-black">
                    S/ {Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Información de envío y contacto */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-white rounded-none border border-[#d9d9d9] p-5 space-y-3 text-xs">
                  <h3 className="font-display font-extrabold uppercase tracking-wider text-black flex items-center gap-1.5 border-b border-[#d9d9d9] pb-2.5">
                    <TbMapPin className="text-[#de2a2a]" size={16} />
                    <span>Lugar de Entrega</span>
                  </h3>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Destino:</span>
                    <strong className="text-black block font-bold mt-0.5">
                      {order.district}, {order.province}, {order.department}
                    </strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Dirección:</span>
                    <p className="text-black mt-0.5 bg-[#f8f8f8] p-2.5 rounded-none border border-[#d9d9d9] font-medium">
                      {order.address}
                    </p>
                  </div>
                  {order.reference && (
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Referencia:</span>
                      <p className="text-neutral-600 italic mt-0.5">{order.reference}</p>
                    </div>
                  )}
                </div>

                {/* Comprobante Electrónico SUNAT si fue emitido */}
                {order.invoicePdfUrl && (
                  <div className="bg-[#2e9e7b]/10 rounded-none border border-[#2e9e7b] p-4 text-xs text-black space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold uppercase">
                        <TbFileInvoice size={18} className="text-[#2e9e7b]" />
                        <span>Comprobante Electrónico</span>
                      </div>
                      <span className="text-[10px] bg-[#2e9e7b] text-white px-2 py-0.5 rounded-none font-bold uppercase">
                        SUNAT {order.invoiceSunatStatus || 'ACEPTADA'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-700">
                      {order.invoiceType === 'factura' ? 'Factura Electrónica' : 'Boleta Electrónica'}:{' '}
                      <strong className="font-mono text-black">{order.invoiceSeries}-{order.invoiceNumber}</strong>
                    </p>
                    <a
                      href={order.invoicePdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-black hover:bg-[#2e9e7b] text-white font-bold uppercase tracking-wider rounded-none transition-colors"
                    >
                      <TbFileInvoice size={15} />
                      <span>Descargar Comprobante PDF</span>
                    </a>
                  </div>
                )}

                {/* Ayuda y Soporte */}
                <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-4 text-xs text-black space-y-2">
                  <div className="flex items-center gap-1.5 font-bold uppercase">
                    <TbHelpCircle size={16} className="text-[#de2a2a]" />
                    <span>¿Necesitas ayuda con tu entrega?</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Si tienes dudas sobre el despacho, contáctanos a nuestro WhatsApp o correo oficial{' '}
                    <strong className="text-black">{company?.email || 'soporte@tienda.com'}</strong> indicando tu número de pedido.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guía informativa si aún no hay búsqueda */}
        {!order && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-600">
            <div className="bg-[#f8f8f8] p-5 rounded-none border border-[#d9d9d9] space-y-2">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-display font-extrabold uppercase text-black text-sm">
                ¿Dónde está mi número de pedido?
              </h4>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Lo encuentras en el correo electrónico de confirmación que te enviamos al momento de comprar (formato ORD-2026-XXXXX).
              </p>
            </div>

            <div className="bg-[#f8f8f8] p-5 rounded-none border border-[#d9d9d9] space-y-2">
              <div className="w-8 h-8 rounded-none bg-[#de2a2a] text-white flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-display font-extrabold uppercase text-black text-sm">
                Delivery rápido y seguro
              </h4>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Despachamos en Lima Metropolitana en el menor tiempo posible con embalaje protegido para vinos, chocolates y café. Envíos a provincias con agencias autorizadas.
              </p>
            </div>

            <div className="bg-[#f8f8f8] p-5 rounded-none border border-[#d9d9d9] space-y-2">
              <div className="w-8 h-8 rounded-none bg-[#2e9e7b] text-white flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-display font-extrabold uppercase text-black text-sm">
                Autenticidad Garantizada
              </h4>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Todos nuestros pedidos se entregan con empaque sellado e intacto, comprobante electrónico SUNAT y seguimiento en línea.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white py-20 text-center text-neutral-500">
          <TbRefresh className="w-8 h-8 mx-auto animate-spin text-[#de2a2a] mb-2" />
          <p className="text-xs font-bold uppercase tracking-wider">Cargando módulo de rastreo...</p>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}

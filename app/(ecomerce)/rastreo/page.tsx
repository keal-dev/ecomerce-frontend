'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  TbTruckDelivery,
  TbPackage,
  TbCheck,
  TbClock,
  TbSearch,
  TbAlertCircle,
  TbMapPin,
  TbChevronRight,
  TbArrowLeft,
  TbHelpCircle,
  TbRefresh,
  TbFileInvoice,
} from 'react-icons/tb';
import { getOrderById } from '@/services/order.service';
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
      const data = await getOrderById(orderIdToSearch.trim());
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

  // Determinar paso activo en la línea de tiempo (1 a 4)
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
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-[#3483fa] transition-colors flex items-center gap-1">
            <TbArrowLeft size={13} />
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-slate-400" />
          <span className="text-slate-800 font-medium">Rastreo de Pedidos</span>
        </nav>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8 text-center relative overflow-hidden">
          <div className="inline-flex p-3 bg-blue-50 text-[#3483fa] rounded-2xl mb-4">
            <TbTruckDelivery size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ¿Dónde está tu compra?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
            Rastrea el estado en tiempo real de tu pedido realizado en la tienda online.
          </p>

          {/* Formulario de búsqueda */}
          <form onSubmit={handleSubmit} className="mt-6 max-w-md mx-auto flex gap-2">
            <div className="relative flex-1">
              <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Ingresa tu número (ej: ORD-2026-48912)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] focus:bg-white outline-hidden transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-[#3483fa] hover:bg-blue-600 disabled:bg-slate-300 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
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
              <span className="text-slate-500 font-medium">Compras en este equipo:</span>
              {recentOrders.map((ro) => (
                <button
                  key={ro.orderNumber}
                  type="button"
                  onClick={() => {
                    setOrderQuery(ro.orderNumber);
                    fetchTracking(ro.orderNumber);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#3483fa] border border-slate-200 rounded-lg font-mono text-[11px] font-bold transition-colors cursor-pointer"
                >
                  {ro.orderNumber}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 text-[12px] text-slate-500">
            ¿No tienes a la mano tu número de pedido?{' '}
            <Link href="/mis-compras" className="text-[#3483fa] font-bold hover:underline">
              Búscalo en Mis Compras
            </Link>
            {' '}con tu correo electrónico o DNI/RUC.
          </div>

          {error && (
            <div className="mt-4 max-w-md mx-auto p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2 text-left">
              <TbAlertCircle size={18} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* RESULTADO DEL PEDIDO */}
        {order && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header del pedido */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Número de Seguimiento
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xl font-bold text-slate-900">
                      #{order.orderNumber}
                    </span>
                    {order.environment === 'test' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        TEST
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs sm:text-right text-slate-500">
                  <span className="block">Fecha de Compra:</span>
                  <strong className="text-slate-800 font-semibold">
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
                <div className="mt-6 p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                  <TbAlertCircle size={22} className="text-rose-600 shrink-0" />
                  <div>
                    <strong className="font-bold block text-sm">Pedido Cancelado</strong>
                    <p className="mt-0.5 text-rose-700">
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
                        desc: 'Empacando en almacén',
                        icon: TbPackage,
                      },
                      {
                        step: 3,
                        label: 'En Camino',
                        desc: 'Con courier / motorizado',
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
                          className={`p-4 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/10'
                              : isCompleted
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-slate-50/60 border-slate-200 opacity-60'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${
                              isCurrent
                                ? 'bg-[#3483fa] text-white shadow-xs'
                                : isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            <IconComponent size={18} />
                          </div>
                          <h4
                            className={`text-xs font-bold ${
                              isCurrent
                                ? 'text-blue-900'
                                : isCompleted
                                ? 'text-emerald-900'
                                : 'text-slate-600'
                            }`}
                          >
                            {st.label}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
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
              <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <TbPackage className="text-[#3483fa]" size={16} />
                  <span>Artículos en tu compra ({order.items?.length || 0})</span>
                </h3>

                <div className="divide-y divide-slate-100">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {item.productImageUrl ? (
                          <img
                            src={item.productImageUrl}
                            alt={item.productTitle}
                            className="w-12 h-12 object-contain rounded-lg border border-slate-100 p-1"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                            <TbPackage size={20} />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{item.productTitle}</p>
                          <p className="text-slate-500 text-[11px]">
                            {item.quantity} x S/ {Number(item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">
                        S/ {Number(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Total de la orden:</span>
                  <span className="text-base font-extrabold text-slate-900">
                    S/ {Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Información de envío y contacto */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                    <TbMapPin className="text-[#3483fa]" size={16} />
                    <span>Lugar de Entrega</span>
                  </h3>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Destino:</span>
                    <strong className="text-slate-900 block font-semibold mt-0.5">
                      {order.district}, {order.province}, {order.department}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Dirección:</span>
                    <p className="text-slate-700 mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-200/60 font-medium">
                      {order.address}
                    </p>
                  </div>
                  {order.reference && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">Referencia:</span>
                      <p className="text-slate-600 italic mt-0.5">{order.reference}</p>
                    </div>
                  )}
                </div>

                {/* Ayuda y Soporte */}
                <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-4 text-xs text-blue-900 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <TbHelpCircle size={16} className="text-[#3483fa]" />
                    <span>¿Necesitas ayuda con tu entrega?</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Si tienes dudas sobre el despacho, contáctanos a nuestro WhatsApp o correo oficial{' '}
                    <strong>{company?.email || 'soporte@tienda.com'}</strong> indicando tu número de pedido.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guía informativa si aún no hay búsqueda */}
        {!order && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#3483fa] flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">¿Dónde está mi número de pedido?</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Lo encuentras en el correo electrónico de confirmación que te enviamos al momento de comprar (formato ORD-2026-XXXXX).
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Tiempos de entrega</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Los envíos en Lima Metropolitana toman entre 24 y 48 horas hábiles. Envíos a provincias se despachan en 48 a 72 horas con agencias autorizadas.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Seguridad y Garantía</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Todos nuestros paquetes se entregan sellados, con su comprobante electrónico y número de seguimiento para tu tranquilidad.
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
        <div className="min-h-screen py-20 text-center text-slate-500">
          <TbRefresh className="w-8 h-8 mx-auto animate-spin text-[#3483fa] mb-2" />
          <p className="text-sm font-medium">Cargando módulo de rastreo...</p>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}


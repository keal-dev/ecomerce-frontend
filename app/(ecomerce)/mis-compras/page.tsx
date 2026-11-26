'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  TbPackage,
  TbTruckDelivery,
  TbSearch,
  TbCheck,
  TbClock,
  TbAlertCircle,
  TbCopy,
  TbChevronRight,
  TbShoppingBag,
  TbFileInvoice,
  TbCalendar,
  TbMapPin,
  TbRefresh,
} from 'react-icons/tb';
import { getMyOrders, trackOrder } from '@/services/order.service';
import { Order } from '@/types/order.types';
import { useAuthStore } from '@/stores/auth.store';

interface StoredRecentOrder {
  orderNumber: string;
  email: string;
  customerName?: string;
  date: string;
  total: number;
  currencySymbol?: string;
  itemsCount?: number;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Pendiente de Pago',
    bg: 'bg-[#f3ff34]',
    text: 'text-black',
    border: 'border-black',
    icon: TbClock,
  },
  paid: {
    label: 'Pago Confirmado',
    bg: 'bg-[#2e9e7b]/10',
    text: 'text-[#2e9e7b]',
    border: 'border-[#2e9e7b]',
    icon: TbCheck,
  },
  preparing: {
    label: 'En Preparación',
    bg: 'bg-black',
    text: 'text-white',
    border: 'border-black',
    icon: TbPackage,
  },
  shipping: {
    label: 'En Camino a tu Domicilio',
    bg: 'bg-[#f8f8f8]',
    text: 'text-black',
    border: 'border-black',
    icon: TbTruckDelivery,
  },
  delivered: {
    label: 'Entregado con Éxito',
    bg: 'bg-[#2e9e7b]',
    text: 'text-white',
    border: 'border-[#2e9e7b]',
    icon: TbCheck,
  },
  cancelled: {
    label: 'Cancelado',
    bg: 'bg-brand-accent',
    text: 'text-white',
    border: 'border-brand-accent',
    icon: TbAlertCircle,
  },
};

function MisComprasContent() {
  const searchParams = useSearchParams();
  const initialEmailParam = searchParams.get('email') || '';

  const { currentUser } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState(initialEmailParam);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recentStored, setRecentStored] = useState<StoredRecentOrder[]>([]);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('my_saved_orders');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRecentStored(parsed);
        }
      }
    } catch (e) {
      console.error('Error leyendo pedidos locales:', e);
    }
  }, []);

  const loadMyAuthenticatedOrders = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);
    setAuthNotice(null);
    try {
      const fetched = await getMyOrders();
      setOrders(fetched);
    } catch (err) {
      console.error('Error al cargar mis compras:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(
    async (queryTerm: string) => {
      const term = queryTerm.trim();
      if (!term) return;

      setLoading(true);
      setHasSearched(true);
      setAuthNotice(null);

      try {
        const isEmail = term.includes('@');
        const isDoc = /^\d{8,11}$/.test(term);

        if (isEmail || isDoc) {
          if (currentUser) {
            const myOrders = await getMyOrders();
            const lowerTerm = term.toLowerCase();
            const filtered = myOrders.filter(
              (o) =>
                (o.customerEmail || '').toLowerCase() === lowerTerm ||
                (o.docNumber || '').trim() === term,
            );
            setOrders(filtered);
          } else {
            setOrders([]);
            setAuthNotice(
              'Por seguridad, inicia sesión con tu cuenta para consultar tu historial por correo o DNI/RUC, o ingresa directamente tu número de pedido exacto (ej: ORD-2026-12345).',
            );
          }
          return;
        }

        const tracked = await trackOrder(term);
        setOrders(tracked ? [tracked] : []);
      } catch (err) {
        console.error('Error al cargar mis compras:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [currentUser],
  );

  useEffect(() => {
    if (currentUser?.email) {
      setSearchQuery(currentUser.email);
      loadMyAuthenticatedOrders();
    } else if (initialEmailParam) {
      setSearchQuery(initialEmailParam);
      loadOrders(initialEmailParam);
    } else if (recentStored.length > 0) {
      const firstOrderNum = recentStored[0]?.orderNumber;
      if (firstOrderNum) {
        setSearchQuery(firstOrderNum);
        loadOrders(firstOrderNum);
      }
    }
  }, [
    currentUser?.email,
    initialEmailParam,
    recentStored,
    loadMyAuthenticatedOrders,
    loadOrders,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders(searchQuery);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-neutral-500 mb-5">
          <Link href="/" className="hover:text-brand-accent transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={12} />
          <span className="text-black font-bold">Mis Compras</span>
        </div>

        {/* Encabezado Principal */}
        <div className="bg-white rounded-none border border-[#d9d9d9] p-5 sm:p-7 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-accent mb-1.5">
                <TbPackage size={15} />
                <span>Historial de Pedidos</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black">
                Mis Compras
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Consulta tus pedidos realizados, revisa el estado de tus envíos y descarga tus comprobantes.
              </p>
            </div>

            <Link
              href="/rastreo"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black hover:bg-brand-accent text-white rounded-none text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
            >
              <TbTruckDelivery size={17} />
              <span>Rastreo en tiempo real</span>
            </Link>
          </div>

          {/* Formulario de búsqueda por código o sesión */}
          <form onSubmit={handleSearchSubmit} className="mt-6 pt-5 border-t border-[#d9d9d9]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2">
              {currentUser
                ? 'Filtrar mis compras por correo, DNI/RUC o número de pedido'
                : 'Buscar pedido por número de orden (ej: ORD-2026-12345)'}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <TbSearch
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    currentUser
                      ? 'Ej: ORD-2026-12345, tu-correo@ejemplo.com o DNI'
                      : 'Ingresa tu número de orden (ej: ORD-2026-12345)'
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8f8f8] border border-[#d9d9d9] rounded-none text-xs sm:text-sm text-black focus:bg-white focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="px-6 py-2.5 bg-brand-accent hover:bg-red-700 disabled:opacity-50 text-white rounded-none text-xs font-bold uppercase tracking-widest transition-colors shrink-0 cursor-pointer"
              >
                {loading ? 'Consultando...' : 'Consultar'}
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 mt-2">
              {currentUser
                ? 'Mostrando los pedidos asociados a tu sesión iniciada.'
                : 'Si compraste como invitado, ingresa tu número de orden exacto o inicia sesión para ver todo tu historial.'}
            </p>
            {authNotice && (
              <div className="mt-3 p-3 rounded-none bg-red-50 border border-brand-accent text-brand-accent text-xs font-medium flex items-start gap-2">
                <TbAlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{authNotice}</span>
              </div>
            )}
          </form>

          {/* Pedidos recientes guardados en este dispositivo */}
          {recentStored.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dashed border-[#d9d9d9]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                Compras realizadas en este dispositivo:
              </span>
              <div className="flex flex-wrap gap-2">
                {recentStored.map((ro) => (
                  <button
                    key={ro.orderNumber}
                    type="button"
                    onClick={() => {
                      setSearchQuery(ro.orderNumber);
                      loadOrders(ro.orderNumber);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f8f8] hover:bg-black hover:text-white border border-[#d9d9d9] hover:border-black rounded-none text-xs text-black transition-colors cursor-pointer"
                  >
                    <TbPackage size={13} />
                    <span className="font-bold font-mono">{ro.orderNumber}</span>
                    <span className="text-[10px] opacity-75">
                      ({ro.currencySymbol || 'S/'} {Number(ro.total).toFixed(2)})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Listado de Pedidos */}
        {loading ? (
          <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-12 text-center">
            <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Buscando tus pedidos...
            </p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Se encontraron {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
              </span>
              <button
                type="button"
                onClick={() => loadOrders(searchQuery)}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-accent hover:underline cursor-pointer"
              >
                <TbRefresh size={14} />
                <span>Actualizar</span>
              </button>
            </div>

            {orders.map((ord) => {
              const cfg = statusConfig[ord.orderStatus] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              const formattedDate = new Date(ord.createdAt).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-none border border-[#d9d9d9] hover:border-black transition-colors p-5 sm:p-6"
                >
                  {/* Fila superior: Orden, Fecha y Estado */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#d9d9d9] gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-none bg-black text-white flex items-center justify-center shrink-0">
                        <TbPackage size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-extrabold text-black tracking-tight">
                            {ord.orderNumber.startsWith('#') ? ord.orderNumber : `#${ord.orderNumber}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(ord.orderNumber)}
                            className="p-1 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                            title="Copiar número de pedido"
                          >
                            {copiedId === ord.orderNumber ? (
                              <TbCheck size={14} className="text-[#2e9e7b]" />
                            ) : (
                              <TbCopy size={14} />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                          <TbCalendar size={13} />
                          <span>{formattedDate}</span>
                          {ord.customerEmail && (
                            <>
                              <span>•</span>
                              <span>{ord.customerEmail}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none border text-[11px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text} ${cfg.border} self-start sm:self-auto`}
                    >
                      <StatusIcon size={15} />
                      <span>{cfg.label}</span>
                    </div>
                  </div>

                  {/* Fila central: Lista de productos comprados */}
                  <div className="py-4 space-y-3">
                    {(ord.items || []).map((it) => (
                      <div key={it.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-none bg-[#f8f8f8] border border-[#d9d9d9] shrink-0 overflow-hidden flex items-center justify-center">
                            {it.productImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={it.productImageUrl}
                                alt={it.productTitle}
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <TbPackage size={18} className="text-neutral-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-black truncate">
                              {it.productTitle}
                            </h4>
                            <p className="text-[11px] text-neutral-500">
                              Cant: {it.quantity} × {ord.currencySymbol || 'S/'}{' '}
                              {Number(it.unitPrice).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-extrabold text-black shrink-0">
                          {ord.currencySymbol || 'S/'} {Number(it.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Fila inferior: Envío, Total y Acciones */}
                  <div className="pt-4 border-t border-[#d9d9d9] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <TbMapPin size={15} className="text-brand-accent shrink-0" />
                      <span className="truncate">
                        Envío a:{' '}
                        <strong className="text-black">
                          {ord.district}, {ord.province}
                        </strong>{' '}
                        ({ord.address})
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 flex-wrap">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                          Total Pagado
                        </span>
                        <span className="font-display text-base font-extrabold text-black">
                          {ord.currencySymbol || 'S/'} {Number(ord.total).toFixed(2)}
                        </span>
                      </div>

                      {ord.invoicePdfUrl && (
                        <a
                          href={ord.invoicePdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#2e9e7b]/10 hover:bg-[#2e9e7b] border border-[#2e9e7b] text-[#2e9e7b] hover:text-white rounded-none text-xs font-bold uppercase tracking-wider transition-colors"
                          title="Descargar comprobante electrónico SUNAT en PDF"
                        >
                          <TbFileInvoice size={15} />
                          <span>
                            {ord.invoiceType === 'factura' ? 'Factura' : 'Boleta'} {ord.invoiceSeries}-{ord.invoiceNumber}
                          </span>
                        </a>
                      )}

                      <Link
                        href={`/rastreo?order=${encodeURIComponent(ord.orderNumber)}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent hover:bg-red-700 text-white rounded-none text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <TbTruckDelivery size={16} />
                        <span>Rastrear</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : hasSearched ? (
          <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-10 text-center space-y-3">
            <div className="w-14 h-14 bg-black text-white rounded-none flex items-center justify-center mx-auto">
              <TbShoppingBag size={28} />
            </div>
            <h3 className="font-display text-base font-extrabold uppercase text-black">
              No encontramos pedidos asociados a &quot;{searchQuery}&quot;
            </h3>
            <p className="text-xs text-neutral-600 max-w-md mx-auto">
              Verifica que el correo o documento coincida con el que ingresaste al comprar, o busca con tu número de orden directo en el rastreador.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/rastreo"
                className="px-5 py-2.5 border border-black bg-white hover:bg-black hover:text-white text-black rounded-none text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Ir a Rastreador por Código
              </Link>
              <Link
                href="/"
                className="px-5 py-2.5 bg-brand-accent hover:bg-red-700 text-white rounded-none text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Explorar Catálogo
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-10 text-center space-y-3">
            <div className="w-14 h-14 bg-black text-white rounded-none flex items-center justify-center mx-auto">
              <TbSearch size={28} />
            </div>
            <h3 className="font-display text-base font-extrabold uppercase text-black">
              Encuentra tus compras al instante
            </h3>
            <p className="text-xs text-neutral-600 max-w-md mx-auto">
              Ingresa el correo electrónico, DNI/RUC o número de orden con el que realizaste tu compra para ver el historial y el estado de tu delivery.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MisComprasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] bg-white flex items-center justify-center text-xs font-bold uppercase tracking-wider text-neutral-500">
          Cargando mis compras...
        </div>
      }
    >
      <MisComprasContent />
    </Suspense>
  );
}

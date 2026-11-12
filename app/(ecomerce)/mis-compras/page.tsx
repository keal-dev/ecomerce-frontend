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
  TbArrowLeft,
  TbExternalLink,
  TbFileInvoice,
  TbCalendar,
  TbMapPin,
  TbRefresh,
  TbUserCheck,
} from 'react-icons/tb';
import { getOrders, getOrderById } from '@/services/order.service';
import { Order, OrderStatus } from '@/types/order.types';
import { useAuthStore } from '@/stores/auth.store';
import { useCompanyStore } from '@/stores/company.store';

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
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: TbClock,
  },
  paid: {
    label: 'Pago Confirmado',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: TbCheck,
  },
  preparing: {
    label: 'En Preparación',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: TbPackage,
  },
  shipping: {
    label: 'En Camino a tu Domicilio',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: TbTruckDelivery,
  },
  delivered: {
    label: 'Entregado con Éxito',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: TbCheck,
  },
  cancelled: {
    label: 'Cancelado',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: TbAlertCircle,
  },
};

function MisComprasContent() {
  const searchParams = useSearchParams();
  const initialEmailParam = searchParams.get('email') || '';

  const { currentUser } = useAuthStore();
  const { company } = useCompanyStore();

  const [searchQuery, setSearchQuery] = useState(initialEmailParam);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recentStored, setRecentStored] = useState<StoredRecentOrder[]>([]);

  // Cargar pedidos guardados en este navegador (localStorage)
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

  const loadOrders = useCallback(async (queryTerm: string) => {
    if (!queryTerm.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const term = queryTerm.trim();
      const isEmail = term.includes('@');
      const isDoc = /^\d{8,11}$/.test(term);

      let fetched: Order[] = [];
      if (isEmail) {
        fetched = await getOrders({ email: term });
      } else if (isDoc) {
        fetched = await getOrders({ docNumber: term });
      } else {
        fetched = await getOrders({ search: term });
      }

      setOrders(fetched);
    } catch (err) {
      console.error('Error al cargar mis compras:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Si el usuario está autenticado o viene email en URL, auto-buscar
  useEffect(() => {
    if (initialEmailParam) {
      setSearchQuery(initialEmailParam);
      loadOrders(initialEmailParam);
    } else if (currentUser?.email) {
      setSearchQuery(currentUser.email);
      loadOrders(currentUser.email);
    } else if (recentStored.length > 0) {
      // Si no hay login pero hay compras recientes en este dispositivo, cargarlas
      const firstEmail = recentStored[0]?.email;
      if (firstEmail) {
        setSearchQuery(firstEmail);
        loadOrders(firstEmail);
      }
    }
  }, [currentUser?.email, initialEmailParam, recentStored, loadOrders]);

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
    <div className="min-h-screen bg-[#f5f5f5] pb-20 pt-4 sm:pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#3483fa] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={12} />
          <span className="text-gray-800 font-medium">Mis Compras</span>
        </div>

        {/* Encabezado Principal */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-7 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#3483fa] rounded-full text-xs font-semibold mb-2">
                <TbPackage size={16} />
                <span>Historial de Pedidos</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Mis Compras
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Consulta tus pedidos realizados, revisa el estado de tus envíos y obtén tus números de orden.
              </p>
            </div>

            <Link
              href="/rastreo"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              <TbTruckDelivery size={18} className="text-[#3483fa]" />
              <span>Rastreo en tiempo real</span>
            </Link>
          </div>

          {/* Formulario de búsqueda por correo o DNI/RUC */}
          <form onSubmit={handleSearchSubmit} className="mt-6 pt-5 border-t border-gray-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Buscar mis compras por correo electrónico o DNI / RUC
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <TbSearch
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ej: tu-correo@ejemplo.com o número de DNI / RUC"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="px-6 py-2.5 bg-[#3483fa] hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
              >
                {loading ? 'Consultando...' : 'Consultar'}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              💡 No necesitas estar registrado para ver tus compras. Ingresa el mismo correo o documento que utilizaste al pagar.
            </p>
          </form>

          {/* Pedidos recientes guardados en este dispositivo */}
          {recentStored.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
              <span className="text-[11px] font-semibold text-gray-500 block mb-2">
                Compras realizadas en este dispositivo:
              </span>
              <div className="flex flex-wrap gap-2">
                {recentStored.map((ro) => (
                  <button
                    key={ro.orderNumber}
                    type="button"
                    onClick={() => {
                      setSearchQuery(ro.email);
                      loadOrders(ro.email);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-blue-50 hover:text-[#3483fa] border border-gray-200 rounded-lg text-xs text-gray-700 transition-colors"
                  >
                    <TbPackage size={13} className="text-gray-400" />
                    <span className="font-bold">{ro.orderNumber}</span>
                    <span className="text-[10px] text-gray-500">
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
          <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-xs">
            <div className="w-8 h-8 border-3 border-[#3483fa] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-gray-600">Buscando tus pedidos...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Se encontraron {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
              </span>
              <button
                type="button"
                onClick={() => loadOrders(searchQuery)}
                className="inline-flex items-center gap-1 text-xs text-[#3483fa] hover:underline cursor-pointer"
              >
                <TbRefresh size={14} />
                <span>Actualizar</span>
              </button>
            </div>

            {orders.map((ord) => {
              const cfg = statusConfig[ord.orderStatus] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              const totalItems = (ord.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);
              const formattedDate = new Date(ord.createdAt).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-shadow p-5 sm:p-6"
                >
                  {/* Fila superior: Orden, Fecha y Estado */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                        <TbPackage size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-gray-900 tracking-tight">
                            {ord.orderNumber.startsWith('#') ? ord.orderNumber : `#${ord.orderNumber}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(ord.orderNumber)}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                            title="Copiar número de pedido"
                          >
                            {copiedId === ord.orderNumber ? (
                              <TbCheck size={14} className="text-emerald-600" />
                            ) : (
                              <TbCopy size={14} />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <TbCalendar size={13} />
                          <span>{formattedDate}</span>
                          <span>•</span>
                          <span>{ord.customerEmail}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${cfg.bg} ${cfg.text} ${cfg.border} self-start sm:self-auto`}
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
                          <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                            {it.productImageUrl ? (
                              <img
                                src={it.productImageUrl}
                                alt={it.productTitle}
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <TbPackage size={18} className="text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                              {it.productTitle}
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              Cant: {it.quantity} × {ord.currencySymbol || 'S/'}{' '}
                              {Number(it.unitPrice).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 shrink-0">
                          {ord.currencySymbol || 'S/'} {Number(it.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Fila inferior: Envío, Total y Acciones */}
                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <TbMapPin size={15} className="text-gray-400 shrink-0" />
                      <span className="truncate">
                        Envío a:{' '}
                        <strong className="text-gray-800">
                          {ord.district}, {ord.province}
                        </strong>{' '}
                        ({ord.address})
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Total Pagado
                        </span>
                        <span className="text-base font-black text-gray-900">
                          {ord.currencySymbol || 'S/'} {Number(ord.total).toFixed(2)}
                        </span>
                      </div>

                      <Link
                        href={`/rastreo?order=${encodeURIComponent(ord.orderNumber)}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#3483fa] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
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
          <div className="bg-white rounded-2xl border border-gray-200/80 p-10 text-center shadow-xs space-y-3">
            <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <TbShoppingBag size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              No encontramos pedidos asociados a "{searchQuery}"
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Verifica que el correo o documento coincida con el que ingresaste al momento de comprar, o intenta buscando con tu número de orden directo en el rastreador.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/rastreo"
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
              >
                Ir a Rastreador por Código
              </Link>
              <Link
                href="/"
                className="px-5 py-2.5 bg-[#3483fa] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Explorar Productos
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-10 text-center shadow-xs space-y-3">
            <div className="w-14 h-14 bg-blue-50 text-[#3483fa] rounded-full flex items-center justify-center mx-auto">
              <TbSearch size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Encuentra tus compras al instante
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Ingresa el correo electrónico o DNI/RUC con el que realizaste tu compra en la barra superior para ver el historial y los números de tus pedidos.
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
        <div className="min-h-[50vh] flex items-center justify-center text-xs text-gray-500">
          Cargando mis compras...
        </div>
      }
    >
      <MisComprasContent />
    </Suspense>
  );
}


'use client';

import React, { useEffect, useState } from 'react';
import {
  TbPackage,
  TbSearch,
  TbFilter,
  TbEye,
  TbCalendar,
  TbCurrencyDollar,
  TbUser,
  TbMapPin,
  TbClock,
  TbCheck,
  TbTruckDelivery,
  TbX,
  TbRefresh,
  TbShieldCheck,
  TbAlertTriangle,
  TbAdjustmentsHorizontal,
} from 'react-icons/tb';
import { useOrderStore } from '@/stores/order.store';
import { Order, OrderStatus } from '@/types/order.types';

export function OrdersManager() {
  const {
    orders,
    selectedOrder,
    isLoading,
    fetchOrders,
    fetchOrderById,
    changeOrderStatus,
    clearSelected,
  } = useOrderStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [envFilter, setEnvFilter] = useState<'ALL' | 'test' | 'production'>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [moreFiltersModalOpen, setMoreFiltersModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'items' | 'shipping' | 'status'>('items');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = () => {
    fetchOrders({
      status: statusFilter !== 'ALL' ? (statusFilter as OrderStatus) : undefined,
      environment: envFilter !== 'ALL' ? envFilter : undefined,
    });
  };

  const handleSelectOrder = async (order: Order) => {
    await fetchOrderById(order.id);
    setDetailModalOpen(true);
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      await changeOrderStatus(selectedOrder.id, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const extraFiltersCount =
    (envFilter !== 'ALL' ? 1 : 0) + (paymentMethodFilter !== 'ALL' ? 1 : 0);

  const isAnyFilterActive =
    Boolean(searchTerm) ||
    statusFilter !== 'ALL' ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    envFilter !== 'ALL' ||
    paymentMethodFilter !== 'ALL';

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
    setEnvFilter('ALL');
    setPaymentMethodFilter('ALL');
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || order.orderStatus === statusFilter;
    const matchesEnv =
      envFilter === 'ALL' || order.environment === envFilter;
    const matchesPayment =
      paymentMethodFilter === 'ALL' ||
      order.paymentMethod?.toLowerCase().includes(paymentMethodFilter.toLowerCase());

    // Filtro por Fechas (Desde - Hasta)
    let matchesDate = true;
    if (order.createdAt) {
      const orderDate = new Date(order.createdAt);
      if (startDate) {
        const start = new Date(startDate + 'T00:00:00');
        matchesDate = matchesDate && orderDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate + 'T23:59:59');
        matchesDate = matchesDate && orderDate <= end;
      }
    }

    return matchesSearch && matchesStatus && matchesEnv && matchesPayment && matchesDate;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <TbClock className="w-3.5 h-3.5" /> En Preparación
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <TbTruckDelivery className="w-3.5 h-3.5" /> Enviado
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TbCheck className="w-3.5 h-3.5" /> Entregado
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <TbX className="w-3.5 h-3.5" /> Cancelado
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <TbClock className="w-3.5 h-3.5" /> Pendiente
          </span>
        );
    }
  };

  const getEnvBadge = (env: 'test' | 'production') => {
    if (env === 'test') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-300">
          <TbAlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          TEST
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
        <TbShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        PROD
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TbPackage className="w-6 h-6 text-indigo-600" />
            Pedidos Online
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gestión y despacho de compras de la tienda web (Culqi / Transferencia).
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <TbRefresh className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* KPI Cards Compactas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <TbPackage className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 truncate">Total Pedidos</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-slate-900">{orders.length}</span>
              <span className="text-[10px] text-slate-400">
                ({orders.filter((o) => o.environment === 'test').length} test)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <TbTruckDelivery className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 truncate">Por Enviar</p>
            <span className="text-base sm:text-lg font-bold text-amber-600">
              {orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'preparing').length}
            </span>
          </div>
        </div>

        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <TbCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 truncate">Entregados</p>
            <span className="text-base sm:text-lg font-bold text-emerald-600">
              {orders.filter((o) => o.orderStatus === 'delivered').length}
            </span>
          </div>
        </div>

        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <TbCurrencyDollar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 truncate">Total Online</p>
            <span className="text-base sm:text-lg font-bold text-slate-900">
              S/ {orders
                .filter((o) => o.orderStatus !== 'cancelled')
                .reduce((sum, o) => sum + Number(o.total || 0), 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          {/* Buscador de texto */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por #pedido, cliente o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Fechas: Inicio y Fin directos */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <TbCalendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">Desde:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-700">Hasta:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
              />
            </div>

            {/* Filtro Estado */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <TbFilter className="w-3.5 h-3.5 text-slate-400" />
              <span>Estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-medium text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="preparing">En Preparación</option>
                <option value="shipping">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Botón Abrir Modal "Más Filtros" */}
            <button
              onClick={() => setMoreFiltersModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                extraFiltersCount > 0
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <TbAdjustmentsHorizontal className="w-3.5 h-3.5" />
              <span>Más Filtros</span>
              {extraFiltersCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-indigo-600 text-white">
                  {extraFiltersCount}
                </span>
              )}
            </button>

            {/* Botón Limpiar Filtros */}
            {isAnyFilterActive && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                title="Limpiar todos los filtros"
              >
                <TbX className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading && orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <TbRefresh className="w-8 h-8 mx-auto animate-spin text-indigo-500 mb-3" />
            <p className="font-medium text-sm">Cargando pedidos de la tienda...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <TbPackage className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700">No se encontraron pedidos</p>
            <p className="text-xs text-slate-400 mt-1">
              Los pedidos que los clientes hagan en la tienda online aparecerán aquí con su estado de pago.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Pedido</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Destino</th>
                  <th className="px-5 py-3.5">Total & Pago</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Pedido, Ambiente y Fecha */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-indigo-600 font-mono text-sm">
                          #{order.orderNumber}
                        </span>
                        {getEnvBadge(order.environment)}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <TbCalendar className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{order.customerName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{order.customerPhone}</div>
                    </td>

                    {/* Destino */}
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-slate-800">
                        {order.district || order.province || 'Lima'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.department || 'Lima'}, {order.province || 'Lima'}
                      </div>
                    </td>

                    {/* Total y Método */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        S/ {Number(order.total).toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500 capitalize mt-0.5">
                        {order.paymentMethod === 'card'
                          ? 'Tarjeta (Culqi)'
                          : order.paymentMethod === 'yape'
                          ? 'Yape (Culqi)'
                          : order.paymentMethod === 'transfer'
                          ? 'Transferencia'
                          : order.paymentMethod}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-4">
                      {getStatusBadge(order.orderStatus)}
                    </td>

                    {/* Acción */}
                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-flex group">
                        <button
                          onClick={() => handleSelectOrder(order)}
                          aria-label="Ver detalle del pedido"
                          className="p-2 text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-xs"
                        >
                          <TbEye className="w-4 h-4" />
                        </button>
                        <span className="absolute right-0 bottom-full mb-1.5 hidden group-hover:inline-block px-2 py-1 text-[11px] font-medium text-white bg-slate-900 rounded-md whitespace-nowrap shadow-md pointer-events-none z-20 transition-opacity">
                          Ver detalle
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {detailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base sm:text-lg font-bold text-slate-900">
                    Pedido #{selectedOrder.orderNumber}
                  </span>
                  {getEnvBadge(selectedOrder.environment)}
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <TbCalendar className="w-3.5 h-3.5" />
                  {new Date(selectedOrder.createdAt).toLocaleString('es-PE')}
                </p>
              </div>
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  clearSelected();
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <TbX className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-50/60 px-5 text-xs font-semibold">
              <button
                onClick={() => setActiveDetailTab('items')}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeDetailTab === 'items'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <TbPackage className="w-4 h-4" />
                <span>Productos & Pago</span>
                <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
                  {selectedOrder.items?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveDetailTab('shipping')}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeDetailTab === 'shipping'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <TbTruckDelivery className="w-4 h-4" />
                <span>Despacho & Envío</span>
              </button>

              <button
                onClick={() => setActiveDetailTab('status')}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeDetailTab === 'status'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <TbClock className="w-4 h-4" />
                <span>Cambiar Estado</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {/* TAB 1: PRODUCTOS & PAGO */}
              {activeDetailTab === 'items' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Artículos Adquiridos
                    </h4>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {selectedOrder.items?.map((item) => (
                        <div key={item.id} className="p-3 bg-white flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            {item.productImageUrl ? (
                              <img
                                src={item.productImageUrl}
                                alt={item.productTitle}
                                className="w-12 h-12 object-cover rounded-lg border border-slate-100"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                <TbPackage className="w-6 h-6" />
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-900">{item.productTitle}</div>
                              <div className="text-slate-500">
                                {item.quantity} unid. x S/ {Number(item.unitPrice).toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-slate-900">
                            S/ {Number(item.subtotal).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial breakdown */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal productos:</span>
                      <span>S/ {Number(selectedOrder.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Costo de envío:</span>
                      <span>S/ {Number(selectedOrder.shippingCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                      <span>Total Pagado:</span>
                      <span className="text-indigo-600">S/ {Number(selectedOrder.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-1 text-[11px] text-slate-500">
                      <div>
                        <span className="font-medium text-slate-700">Método de pago:</span>{' '}
                        <span className="capitalize">
                          {selectedOrder.paymentMethod === 'card'
                            ? 'Tarjeta (Culqi)'
                            : selectedOrder.paymentMethod === 'yape'
                            ? 'Yape (Culqi)'
                            : selectedOrder.paymentMethod === 'transfer'
                            ? 'Transferencia'
                            : selectedOrder.paymentMethod}
                        </span>
                      </div>
                      {selectedOrder.culqiChargeId && (
                        <div className="font-mono">
                          <span className="font-medium font-sans text-slate-700">ID Cargo Culqi:</span>{' '}
                          {selectedOrder.culqiChargeId}
                        </div>
                      )}
                      {selectedOrder.invoiceType && (
                        <div>
                          <span className="font-medium text-slate-700">Comprobante solicitado:</span>{' '}
                          <span className="capitalize font-semibold">{selectedOrder.invoiceType}</span>
                          {selectedOrder.companyRuc && ` (RUC: ${selectedOrder.companyRuc} - ${selectedOrder.companyLegalName})`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DESPACHO & ENVÍO */}
              {activeDetailTab === 'shipping' && (
                <div className="space-y-4">
                  {/* Datos del Comprador */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <TbUser className="w-3.5 h-3.5 text-indigo-500" />
                      Datos del Comprador / Receptor
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block">Nombres y Apellidos:</span>
                        <strong className="text-slate-900 text-sm">{selectedOrder.customerName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Documento de Identidad:</span>
                        <strong className="text-slate-900">
                          {selectedOrder.docType?.toUpperCase() || 'DNI'}: {selectedOrder.docNumber}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Teléfono / Celular:</span>
                        <a
                          href={`tel:${selectedOrder.customerPhone}`}
                          className="text-indigo-600 font-semibold hover:underline"
                        >
                          {selectedOrder.customerPhone}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Correo Electrónico:</span>
                        <span className="text-slate-800">{selectedOrder.customerEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dirección de Destino */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <TbMapPin className="w-3.5 h-3.5 text-indigo-500" />
                      Lugar de Entrega
                    </h4>
                    <div className="space-y-2 text-xs text-slate-700">
                      <div>
                        <span className="text-slate-500">Ubicación Geográfica:</span>
                        <p className="text-slate-900 font-semibold mt-0.5">
                          {selectedOrder.department} / {selectedOrder.province} / {selectedOrder.district}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Dirección exacta:</span>
                        <p className="text-slate-900 font-medium mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200">
                          {selectedOrder.address}
                        </p>
                      </div>
                      {selectedOrder.reference && (
                        <div>
                          <span className="text-slate-500">Referencia de entrega:</span>
                          <p className="text-slate-700 italic mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200">
                            {selectedOrder.reference}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CAMBIAR ESTADO */}
              {activeDetailTab === 'status' && (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <span className="text-xs text-indigo-700 font-semibold uppercase tracking-wider block">
                      Estado Actual del Pedido
                    </span>
                    <div className="mt-2 flex items-center gap-2">
                      {getStatusBadge(selectedOrder.orderStatus)}
                      <span className="text-xs text-slate-500">
                        {selectedOrder.orderStatus === 'pending' && 'El pedido está a la espera de confirmación de almacén.'}
                        {selectedOrder.orderStatus === 'preparing' && 'El personal de almacén está armando el paquete.'}
                        {selectedOrder.orderStatus === 'shipping' && 'El paquete se encuentra con el repartidor o agencia courier.'}
                        {selectedOrder.orderStatus === 'delivered' && 'El cliente ya recibió el pedido con éxito.'}
                        {selectedOrder.orderStatus === 'cancelled' && 'El pedido fue cancelado y no debe despacharse.'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-700 tracking-wider block mb-2">
                      Seleccionar Nuevo Estado:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: 'pending', label: 'Pendiente', desc: 'Recibido, pendiente de preparación' },
                        { id: 'preparing', label: 'En Preparación', desc: 'Empaquetando en almacén' },
                        { id: 'shipping', label: 'Enviado', desc: 'En ruta con courier / motorizado' },
                        { id: 'delivered', label: 'Entregado', desc: 'Entregado al comprador' },
                        { id: 'cancelled', label: 'Cancelado', desc: 'Anular pedido y reponer stock' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          disabled={updatingStatus || selectedOrder.orderStatus === st.id}
                          onClick={() => handleStatusChange(st.id as OrderStatus)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedOrder.orderStatus === st.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="font-semibold text-xs flex items-center justify-between">
                            {st.label}
                            {selectedOrder.orderStatus === st.id && (
                              <TbCheck className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div
                            className={`text-[11px] mt-0.5 ${
                              selectedOrder.orderStatus === st.id ? 'text-indigo-100' : 'text-slate-400'
                            }`}
                          >
                            {st.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Pestaña actual: <strong className="text-slate-600 capitalize">{activeDetailTab === 'items' ? 'Productos' : activeDetailTab === 'shipping' ? 'Despacho' : 'Estado'}</strong>
              </span>
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  clearSelected();
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* More Filters Modal */}
      {moreFiltersModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <TbAdjustmentsHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Filtros Avanzados</h3>
                  <p className="text-xs text-slate-500">Ajusta criterios específicos para tus pedidos</p>
                </div>
              </div>
              <button
                onClick={() => setMoreFiltersModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <TbX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              {/* Filtro de Ambiente */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Ambiente de Transacción:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ALL', label: 'Todos' },
                    { id: 'test', label: 'TEST (Pruebas)' },
                    { id: 'production', label: 'PROD (Real)' },
                  ].map((env) => (
                    <button
                      key={env.id}
                      type="button"
                      onClick={() => setEnvFilter(env.id as any)}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer text-center ${
                        envFilter === env.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {env.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro de Método de Pago */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Método de Pago:
                </label>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Todos los métodos de pago</option>
                  <option value="card">Tarjeta de Crédito / Débito (Culqi)</option>
                  <option value="yape">Yape (Culqi)</option>
                  <option value="transfer">Transferencia Bancaria Directa</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setEnvFilter('ALL');
                  setPaymentMethodFilter('ALL');
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Restablecer
              </button>
              <button
                type="button"
                onClick={() => setMoreFiltersModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Aplicar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersManager;

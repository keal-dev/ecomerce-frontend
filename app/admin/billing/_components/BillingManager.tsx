'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TbReceipt,
  TbFileInvoice,
  TbCheck,
  TbClock,
  TbSearch,
  TbFilter,
  TbExternalLink,
  TbDownload,
  TbRefresh,
  TbBuildingStore,
  TbShieldCheck,
  TbAlertCircle,
  TbChevronRight,
  TbPlus,
  TbEye,
  TbUser,
  TbCash,
} from 'react-icons/tb';
import { getOrders, emitOrderInvoice } from '@/services/order.service';
import { Order } from '@/types/order.types';

export function BillingManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'web' | 'pos'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'boleta' | 'factura'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'emitted' | 'pending'>('ALL');
  const [emittingId, setEmittingId] = useState<string | null>(null);

  const isPosOrder = (order: Order) =>
    (order.orderNumber || '').toUpperCase().startsWith('POS-') ||
    (order.paymentMethod || '').toUpperCase().startsWith('POS');

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error al cargar comprobantes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Comprobantes emitidos
  const emittedOrders = useMemo(() => {
    return orders.filter((o) => Boolean(o.invoicePdfUrl));
  }, [orders]);

  // Pendientes de emisión (pagados pero sin PDF generado)
  const pendingOrders = useMemo(() => {
    return orders.filter((o) => !o.invoicePdfUrl && o.paymentStatus === 'paid');
  }, [orders]);

  // Métricas
  const totalInvoiced = useMemo(() => {
    return emittedOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  }, [emittedOrders]);

  const totalBoletas = useMemo(() => {
    return emittedOrders.filter((o) => (o.invoiceType || '').toLowerCase() !== 'factura').length;
  }, [emittedOrders]);

  const totalFacturas = useMemo(() => {
    return emittedOrders.filter((o) => (o.invoiceType || '').toLowerCase() === 'factura').length;
  }, [emittedOrders]);

  // Filtrado de lista
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filtro por canal (Tienda Web vs Mostrador POS)
      if (channelFilter === 'pos' && !isPosOrder(order)) return false;
      if (channelFilter === 'web' && isPosOrder(order)) return false;

      // Filtro de estado de emisión
      if (statusFilter === 'emitted' && !order.invoicePdfUrl) return false;
      if (statusFilter === 'pending' && (order.invoicePdfUrl || order.paymentStatus !== 'paid')) return false;

      // Filtro por tipo de comprobante
      if (typeFilter !== 'ALL') {
        const orderType = (order.invoiceType || 'boleta').toLowerCase();
        if (orderType !== typeFilter) return false;
      }

      // Filtro por buscador
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const num = (order.orderNumber || '').toLowerCase();
        const client = (order.customerName || '').toLowerCase();
        const doc = (order.docNumber || '').toLowerCase();
        const ruc = (order.companyRuc || '').toLowerCase();
        const legal = (order.companyLegalName || '').toLowerCase();
        const invNum = `${order.invoiceSeries || ''}-${order.invoiceNumber || ''}`.toLowerCase();

        return (
          num.includes(q) ||
          client.includes(q) ||
          doc.includes(q) ||
          ruc.includes(q) ||
          legal.includes(q) ||
          invNum.includes(q)
        );
      }

      return true;
    });
  }, [orders, channelFilter, statusFilter, typeFilter, searchTerm]);

  const handleEmitManual = async (orderId: string) => {
    setEmittingId(orderId);
    try {
      await emitOrderInvoice(orderId);
      await fetchInvoices();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al emitir comprobante en Facturalo.pe');
    } finally {
      setEmittingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              SUNAT PSE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Entorno: Demo (Facturalo.pe)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <TbReceipt className="text-indigo-600" />
            <span>Facturación Electrónica</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consulta y administra las Boletas y Facturas electrónicas oficiales emitidas para tus clientes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchInvoices}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <TbRefresh className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <a
            href="https://facturalo.pe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <span>Consola Facturalo.pe</span>
            <TbExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Comprobantes</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{emittedOrders.length}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Emitidos
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Aceptados por SUNAT</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Boletas Electrónicas (B001)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{totalBoletas}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              DNI / Varios
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Consumidores finales</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Facturas Electrónicas (F001)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{totalFacturas}</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              RUC
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Con derecho a crédito fiscal</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Monto Total Facturado</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">
              S/ {totalInvoiced.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
              PEN
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Incluye 18% IGV</span>
        </div>
      </div>

      {/* Alerta de pedidos pendientes de emisión si existen */}
      {pendingOrders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <TbAlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Hay <strong>{pendingOrders.length}</strong> pedido(s) pagado(s) que aún no tienen comprobante generado. Puedes emitirlos directamente en la tabla con un clic.
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('pending')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            Ver Pendientes
          </button>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por serie, número, cliente, DNI o RUC..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos los canales</option>
            <option value="web">Tienda Online (Web)</option>
            <option value="pos">Tienda Física (POS)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="boleta">Solo Boletas (B001)</option>
            <option value="factura">Solo Facturas (F001)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos los estados</option>
            <option value="emitted">Solo Emitidos</option>
            <option value="pending">Pendientes de emisión</option>
          </select>
        </div>
      </div>

      {/* Tabla de Comprobantes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading && orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Cargando comprobantes electrónicos...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <TbFileInvoice className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No se encontraron comprobantes</p>
            <p className="text-xs text-slate-400 mt-1">
              Las boletas y facturas que emitas aparecerán en este registro histórico.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Comprobante</th>
                  <th className="px-5 py-3.5">Canal</th>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Cliente / Receptor</th>
                  <th className="px-5 py-3.5">Fecha</th>
                  <th className="px-5 py-3.5">Total (IGV)</th>
                  <th className="px-5 py-3.5">Estado SUNAT</th>
                  <th className="px-5 py-3.5 text-right">Archivos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => {
                  const isFactura = (ord.invoiceType || '').toLowerCase() === 'factura';
                  const hasInvoice = Boolean(ord.invoicePdfUrl);
                  const isPos = isPosOrder(ord);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Comprobante */}
                      <td className="px-5 py-3.5">
                        {hasInvoice ? (
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                {ord.invoiceSeries}-{ord.invoiceNumber}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${
                                  (ord.invoiceEnvironment || (ord.environment === 'production' ? 'production' : 'demo')) === 'production'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}
                                title={
                                  (ord.invoiceEnvironment || (ord.environment === 'production' ? 'production' : 'demo')) === 'production'
                                    ? 'Emitido en Producción (SUNAT Real)'
                                    : 'Emitido en Demo / Pruebas (Facturalo.pe)'
                                }
                              >
                                {(ord.invoiceEnvironment || (ord.environment === 'production' ? 'production' : 'demo')) === 'production' ? 'PROD' : 'DEMO'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Operación: <span className="font-mono">{ord.orderNumber}</span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400 italic font-mono text-[11px]">
                                Sin comprobante
                              </span>
                              <span className="px-1 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-500">
                                {ord.environment === 'production' ? 'PROD' : 'DEMO'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Operación: <span className="font-mono text-indigo-600 font-semibold">{ord.orderNumber}</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Canal */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isPos ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                            <TbBuildingStore size={13} className="text-slate-500" />
                            <span>Tienda POS</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] bg-sky-50 text-sky-700 border border-sky-200">
                            <span>Tienda Web</span>
                          </span>
                        )}
                      </td>

                      {/* Tipo */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            isFactura
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isFactura ? 'Factura (01)' : 'Boleta (03)'}
                        </span>
                      </td>

                      {/* Cliente */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">
                          {isFactura && ord.companyLegalName ? ord.companyLegalName : ord.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isFactura ? `RUC: ${ord.companyRuc || ord.docNumber}` : `DNI: ${ord.docNumber}`}
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                        {new Date(ord.createdAt).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {ord.currencySymbol || 'S/'} {Number(ord.total).toFixed(2)}
                      </td>

                      {/* Estado SUNAT */}
                      <td className="px-5 py-3.5">
                        {hasInvoice ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <TbCheck size={12} />
                            <span>{ord.invoiceSunatStatus || 'ACEPTADA'}</span>
                          </span>
                        ) : ord.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <TbClock size={12} />
                            <span>Pendiente</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            No pagado
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {hasInvoice ? (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {ord.invoiceXmlUrl && (
                              <a
                                href={ord.invoiceXmlUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                                title="Descargar XML firmado SUNAT"
                              >
                                XML
                              </a>
                            )}
                            {ord.invoicePdfUrl && (
                              <a
                                href={ord.invoicePdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-2xs"
                                title="Ver comprobante en PDF"
                              >
                                <TbDownload size={13} />
                                <span>PDF</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={emittingId === ord.id}
                            onClick={() => handleEmitManual(ord.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                          >
                            {emittingId === ord.id ? 'Emitiendo...' : 'Emitir Ahora'}
                          </button>
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

    </div>
  );
}


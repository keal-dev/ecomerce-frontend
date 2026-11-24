'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  TbBell, 
  TbBuildingStore, 
  TbMenu2,
  TbBuilding,
  TbTruckDelivery,
  TbAlertTriangle,
  TbReceipt,
  TbCheck,
  TbRefresh,
  TbChevronRight,
} from 'react-icons/tb';
import { UserButton, Show } from '@clerk/nextjs';
import { useAdminNavStore } from '@/stores/admin-nav.store';
import { useCompanyStore } from '@/stores/company.store';
import { getOrders } from '@/services/order.service';
import { getProducts } from '@/services/product.service';
import { Order } from '@/types/order.types';
import { Product } from '@/types/product.types';

export function Header() {
  const { toggleMobileSidebar } = useAdminNavStore();
  const { company, fetchCompany } = useCompanyStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [pendingWebOrders, setPendingWebOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [unbilledOrders, setUnbilledOrders] = useState<Order[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const [ordersData, productsData] = await Promise.all([
        getOrders().catch(() => []),
        getProducts().catch(() => []),
      ]);

      // 1. Pedidos web pendientes o en preparación (excluyendo ventas POS de mostrador)
      const webPending = ordersData.filter(
        (o) =>
          !(o.orderNumber || '').toUpperCase().startsWith('POS-') &&
          !(o.paymentMethod || '').toUpperCase().startsWith('POS') &&
          (o.orderStatus === 'pending' || o.orderStatus === 'preparing'),
      );

      // 2. Productos activos con stock crítico o agotado (<= 5 unidades)
      const criticalProducts = productsData.filter(
        (p) => p.isActive !== false && (Number(p.stock) || 0) <= 5,
      );

      // 3. Órdenes pagadas sin comprobante electrónico emitido
      const pendingInvoices = ordersData.filter(
        (o) => o.paymentStatus === 'paid' && !o.invoicePdfUrl,
      );

      setPendingWebOrders(webPending);
      setLowStockProducts(criticalProducts);
      setUnbilledOrders(pendingInvoices);
    } catch (e) {
      console.error('Error cargando alertas del header:', e);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();
    loadAlerts();
  }, [fetchCompany, loadAlerts]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const totalAlerts =
    pendingWebOrders.length + lowStockProducts.length + unbilledOrders.length;

  return (
    <header className="h-[52px] bg-brand border-b border-black/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Lado Izquierdo: Botón Menú Móvil + Logo de la empresa + Indicador de Empresa */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Botón de Menú Móvil (solo en móviles y tablets: lg:hidden) */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Abrir menú de navegación"
          className="lg:hidden p-1.5 -ml-1 text-gray-900 hover:text-black hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
        >
          <TbMenu2 size={20} />
        </button>

        {/* Logo de la empresa (solo visible en móviles y tablets: lg:hidden) */}
        <Link 
          href="/admin" 
          className="lg:hidden w-7 h-7 rounded-lg bg-white/80 text-gray-900 font-black text-sm flex items-center justify-center border border-black/10 shadow-2xs hover:bg-white transition-opacity shrink-0"
          title="Ir al Dashboard"
          aria-label="Inicio del Dashboard"
        >
          {company?.name ? company.name.charAt(0).toUpperCase() : 'M'}
        </Link>

        {/* Divisor vertical fino (solo en móviles y tablets) */}
        <div className="lg:hidden h-4.5 w-px bg-black/15 shrink-0" />

        {/* Identificador de Empresa */}
        <div 
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-black/10 bg-black/5 text-xs font-semibold text-gray-900 select-none"
          title={company?.legalName || company?.name || 'Empresa'}
        >
          <TbBuilding size={15} className="text-gray-800 shrink-0" />
          <span className="truncate max-w-[160px] sm:max-w-[240px] font-bold text-gray-900">
            {company?.name || 'MercadoAdmin'}
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Link to store (icono en móviles y tablets, con texto en escritorio) */}
        <Link
          href="/"
          title="Ver tienda"
          aria-label="Ver tienda"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 hover:text-black border border-black/10 p-2 lg:px-3 lg:py-1.5 rounded-lg bg-black/5 hover:bg-black/10 transition-colors cursor-pointer"
        >
          <TbBuildingStore size={16} className="text-gray-800 shrink-0" />
          <span className="hidden lg:inline">Ver tienda</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => {
              const nextState = !notifOpen;
              setNotifOpen(nextState);
              if (nextState) loadAlerts();
            }}
            aria-label="Notificaciones"
            className="relative p-2 text-gray-900 hover:text-black hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
          >
            <TbBell size={20} />
            {totalAlerts > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-brand">
                {totalAlerts > 99 ? '99+' : totalAlerts}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full border border-brand" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header del panel de notificaciones */}
              <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                    Centro de Alertas
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {totalAlerts > 0
                      ? `${totalAlerts} alerta(s) requieren atención`
                      : 'Todo tu negocio está al día'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadAlerts}
                  disabled={loadingAlerts}
                  className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-lg transition-colors cursor-pointer"
                  title="Actualizar alertas"
                >
                  <TbRefresh size={15} className={loadingAlerts ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Lista de alertas */}
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                {totalAlerts === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <TbCheck size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-800">
                      Sin alertas pendientes
                    </p>
                    <p className="text-[11px] text-gray-400">
                      No tienes pedidos retrasados ni productos con stock crítico.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 1. Pedidos Web por Despachar */}
                    {pendingWebOrders.length > 0 && (
                      <Link
                        href="/admin/orders"
                        onClick={() => setNotifOpen(false)}
                        className="p-3.5 hover:bg-gray-50 flex items-start gap-3 transition-colors"
                      >
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0 mt-0.5">
                          <TbTruckDelivery size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-gray-900">
                              Pedidos Online por Enviar
                            </p>
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                              {pendingWebOrders.length}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                            Último: #{pendingWebOrders[0].orderNumber} ({pendingWebOrders[0].customerName})
                          </p>
                        </div>
                        <TbChevronRight size={15} className="text-gray-400 shrink-0 self-center" />
                      </Link>
                    )}

                    {/* 2. Productos con Stock Agotado o Crítico */}
                    {lowStockProducts.length > 0 && (
                      <Link
                        href="/admin/inventory"
                        onClick={() => setNotifOpen(false)}
                        className="p-3.5 hover:bg-gray-50 flex items-start gap-3 transition-colors"
                      >
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0 mt-0.5">
                          <TbAlertTriangle size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-gray-900">
                              Stock Crítico o Agotado
                            </p>
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800">
                              {lowStockProducts.length} prod.
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                            {lowStockProducts
                              .slice(0, 2)
                              .map((p) => `${p.title} (${p.stock ?? 0})`)
                              .join(', ')}
                          </p>
                        </div>
                        <TbChevronRight size={15} className="text-gray-400 shrink-0 self-center" />
                      </Link>
                    )}

                    {/* 3. Comprobantes SUNAT Pendientes de Emisión */}
                    {unbilledOrders.length > 0 && (
                      <Link
                        href="/admin/billing"
                        onClick={() => setNotifOpen(false)}
                        className="p-3.5 hover:bg-gray-50 flex items-start gap-3 transition-colors"
                      >
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                          <TbReceipt size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-gray-900">
                              Comprobantes por Emitir
                            </p>
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-800">
                              {unbilledOrders.length}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Ventas pagadas pendientes de Boleta/Factura SUNAT.
                          </p>
                        </div>
                        <TbChevronRight size={15} className="text-gray-400 shrink-0 self-center" />
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clerk User Button */}
        <div className="flex items-center pl-2 border-l border-black/15">
          <Show when="signed-in">
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8"
                }
              }}
            />
          </Show>
        </div>
      </div>
    </header>
  );
}

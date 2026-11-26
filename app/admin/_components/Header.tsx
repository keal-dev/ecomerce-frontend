'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  TbLayoutDashboard,
  TbPackage,
  TbShoppingCart,
  TbClipboardList,
  TbBook,
  TbBox,
  TbCategory,
  TbTag,
  TbSettings,
  TbCash,
  TbPhotoVideo,
  TbUsers,
  TbDatabase,
} from 'react-icons/tb';
import { UserButton, Show } from '@clerk/nextjs';
import { useAdminNavStore } from '@/stores/admin-nav.store';
import { useCompanyStore } from '@/stores/company.store';
import { getOrders } from '@/services/order.service';
import { getProducts } from '@/services/product.service';
import { Order } from '@/types/order.types';
import { Product } from '@/types/product.types';

interface AdminSectionInfo {
  title: string;
  parent?: string;
  icon: React.ElementType;
}

const ADMIN_SECTION_ROUTES: { prefix: string; exact?: boolean; info: AdminSectionInfo }[] = [
  { prefix: '/admin', exact: true, info: { title: 'Dashboard', icon: TbLayoutDashboard } },
  { prefix: '/admin/orders', info: { title: 'Pedidos Online', icon: TbPackage } },
  { prefix: '/admin/sales', info: { title: 'Punto de Venta (POS)', icon: TbShoppingCart } },
  { prefix: '/admin/billing', info: { title: 'Facturación', icon: TbReceipt } },
  { prefix: '/admin/inventory', info: { title: 'Inventario', icon: TbClipboardList } },
  { prefix: '/admin/purchases/new', info: { title: 'Nueva Compra', parent: 'Compras', icon: TbTruckDelivery } },
  { prefix: '/admin/purchases', info: { title: 'Compras', icon: TbTruckDelivery } },
  { prefix: '/admin/suppliers', info: { title: 'Proveedores', icon: TbBuildingStore } },
  { prefix: '/admin/claims', info: { title: 'Reclamaciones', icon: TbBook } },
  { prefix: '/admin/products/new', info: { title: 'Nuevo Producto', parent: 'Productos', icon: TbBox } },
  { prefix: '/admin/products/', info: { title: 'Editar Producto', parent: 'Productos', icon: TbBox } },
  { prefix: '/admin/products', info: { title: 'Productos', icon: TbBox } },
  { prefix: '/admin/categories', info: { title: 'Categorías', icon: TbCategory } },
  { prefix: '/admin/brands', info: { title: 'Marcas', icon: TbTag } },
  { prefix: '/admin/settings/cash-register', info: { title: 'Caja', parent: 'Configuración', icon: TbCash } },
  { prefix: '/admin/settings/company', info: { title: 'Datos de la Empresa', parent: 'Configuración', icon: TbBuilding } },
  { prefix: '/admin/settings/marketing', info: { title: 'Banners y Marketing', parent: 'Configuración', icon: TbPhotoVideo } },
  { prefix: '/admin/settings/users/new', info: { title: 'Nuevo Usuario', parent: 'Usuarios y Roles', icon: TbUsers } },
  { prefix: '/admin/settings/users', info: { title: 'Usuarios y Roles', parent: 'Configuración', icon: TbUsers } },
  { prefix: '/admin/settings/billing', info: { title: 'Series SUNAT', parent: 'Configuración', icon: TbReceipt } },
  { prefix: '/admin/settings/database-reset', info: { title: 'Resetear Base de Datos', parent: 'Configuración', icon: TbDatabase } },
  { prefix: '/admin/settings', info: { title: 'Configuración', icon: TbSettings } },
];

function getCurrentSection(pathname: string): AdminSectionInfo {
  const match = ADMIN_SECTION_ROUTES.find((route) =>
    route.exact
      ? pathname === route.prefix
      : pathname === route.prefix || pathname.startsWith(route.prefix.endsWith('/') ? route.prefix : `${route.prefix}/`),
  );
  return match?.info ?? { title: 'Panel Administrativo', icon: TbLayoutDashboard };
}

export function Header() {
  const pathname = usePathname();
  const currentSection = useMemo(() => getCurrentSection(pathname || '/admin'), [pathname]);
  const SectionIcon = currentSection.icon;
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
    <header className="h-[52px] bg-brand-primary border-b border-white/15 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 text-white">
      {/* Lado Izquierdo: Botón Menú Móvil + Logo de la empresa + Indicador de Empresa */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Botón de Menú Móvil (solo en móviles y tablets: lg:hidden) */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Abrir menú de navegación"
          className="lg:hidden p-1.5 -ml-1 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
        >
          <TbMenu2 size={20} />
        </button>

        {/* Logo de la empresa (solo visible en móviles y tablets: lg:hidden) */}
        <Link 
          href="/admin" 
          className="lg:hidden w-7 h-7 rounded-lg bg-brand-accent text-white font-black text-sm flex items-center justify-center shadow-2xs hover:bg-red-700 transition-colors shrink-0"
          title="Ir al Dashboard"
          aria-label="Inicio del Dashboard"
        >
          {company?.name ? company.name.charAt(0).toUpperCase() : 'C'}
        </Link>

        {/* Divisor vertical fino (solo en móviles y tablets) */}
        <div className="lg:hidden h-4.5 w-px bg-white/15 shrink-0" />

        {/* Indicador de Sección Actual */}
        <div 
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#262626] bg-white/5 text-xs font-semibold text-white select-none"
          title={currentSection.parent ? `${currentSection.parent} / ${currentSection.title}` : currentSection.title}
        >
          <SectionIcon size={15} className="text-brand-accent shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0">
            {currentSection.parent && (
              <span className="hidden sm:inline text-neutral-400 font-medium whitespace-nowrap">
                {currentSection.parent} /
              </span>
            )}
            <span className="truncate max-w-[170px] sm:max-w-[280px] font-bold text-white">
              {currentSection.title}
            </span>
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Link to store (icono en móviles y tablets, con texto en escritorio) */}
        <Link
          href="/"
          title="Ver tienda"
          aria-label="Ver tienda"
          className="flex items-center gap-1.5 text-xs font-semibold text-white border border-white/20 p-2 lg:px-3 lg:py-1.5 rounded-lg bg-white/5 hover:bg-brand-accent hover:border-brand-accent transition-colors cursor-pointer"
        >
          <TbBuildingStore size={16} className="shrink-0" />
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
            className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <TbBell size={20} />
            {totalAlerts > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-brand-accent text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black">
                {totalAlerts > 99 ? '99+' : totalAlerts}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2e9e7b] rounded-full border border-black" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-[#242424] rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header del panel de notificaciones */}
              <div className="px-4 py-3 bg-brand-primary text-white border-b border-white/15 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                    Centro de Alertas
                  </h3>
                  <p className="text-[11px] text-neutral-300">
                    {totalAlerts > 0
                      ? `${totalAlerts} alerta(s) requieren atención`
                      : 'Todo tu negocio está al día'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadAlerts}
                  disabled={loadingAlerts}
                  className="p-1.5 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
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
        <div className="flex items-center pl-2 border-l border-white/15">
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

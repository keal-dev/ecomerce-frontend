'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  TbLayoutDashboard, 
  TbBox, 
  TbCategory, 
  TbTag,
  TbShoppingCart, 
  TbReceipt, 
  TbClipboardList, 
  TbTruckDelivery, 
  TbSettings, 
  TbBuildingStore,
  TbPackage,
  TbBook,
  TbX 
} from 'react-icons/tb';
import { useAdminNavStore } from '@/stores/admin-nav.store';
import { useCompanyStore } from '@/stores/company.store';
import { useAuthStore } from '@/stores/auth.store';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

// Bloque 1: Operaciones y Ventas
const operationsLinks: NavItem[] = [
  { name: 'Pedidos Online', href: '/admin/orders', icon: TbPackage, badge: 'Web' },
  { name: 'Punto de Venta (POS)', href: '/admin/sales', icon: TbShoppingCart },
  { name: 'Facturación', href: '/admin/billing', icon: TbReceipt },
  { name: 'Inventario', href: '/admin/inventory', icon: TbClipboardList },
  { name: 'Compras', href: '/admin/purchases', icon: TbTruckDelivery },
  { name: 'Proveedores', href: '/admin/suppliers', icon: TbBuildingStore },
  { name: 'Reclamaciones', href: '/admin/claims', icon: TbBook },
];

// Bloque 2: Mantenimientos y Catálogo (Exclusivo SUPER_ADMIN)
const catalogLinks: NavItem[] = [
  { name: 'Productos', href: '/admin/products', icon: TbBox },
  { name: 'Categorías', href: '/admin/categories', icon: TbCategory },
  { name: 'Marcas', href: '/admin/brands', icon: TbTag },
];

// Bloque 3: Otros (Exclusivo SUPER_ADMIN)
const otherLinks: NavItem[] = [
  { name: 'Configuración', href: '/admin/settings', icon: TbSettings },
];

function SidebarInner({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const isDashboardActive = pathname === '/admin';
  const { company, fetchCompany } = useCompanyStore();
  const { currentUser } = useAuthStore();

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isSeller = currentUser?.role === 'seller';

  // Si es Vendedor, ve pedidos, ventas POS y facturación
  const visibleOperations = React.useMemo(() => {
    if (isSeller) {
      return operationsLinks.filter(
        (item) => item.href === '/admin/orders' || item.href === '/admin/sales' || item.href === '/admin/billing',
      );
    }
    return operationsLinks;
  }, [isSeller]);

  React.useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  return (
    <div 
      className="flex flex-col h-full bg-black transition-colors duration-300"
    >
      {/* Logo Header: Negro puro matching el cuerpo del sidebar */}
      <div className="h-[52px] bg-black border-b border-[#262626] flex items-center justify-between px-3 shrink-0">
        <Link 
          href="/admin" 
          onClick={onClose}
          className="flex items-center min-w-0"
        >
          <div className="w-11 h-9 flex items-center justify-center overflow-hidden shrink-0">
            {company?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={company.logoUrl} 
                alt={company.name || 'Logo'} 
                className="w-full h-full object-contain p-1" 
              />
            ) : (
              <TbBuildingStore size={19} className="text-neutral-300" />
            )}
          </div>
          <span className="font-display font-bold uppercase text-sm text-white tracking-[0.06em] truncate max-w-[150px]">
            {company?.name || 'Cooperativa Gourmet'}
          </span>
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer lg:hidden"
          >
            <TbX size={20} />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-2.5 py-2.5 space-y-2.5 overflow-y-auto bg-black">
        {/* Dashboard Principal */}
        <div>
          <Link
            href="/admin"
            onClick={onClose}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-all duration-150 ${
              isDashboardActive
                ? 'bg-[#de2a2a] text-white font-semibold shadow-xs'
                : 'text-neutral-400 hover:bg-white/10 hover:text-white font-medium'
            }`}
          >
            <div className="flex items-center gap-2">
              <TbLayoutDashboard 
                size={17} 
                className={isDashboardActive ? 'text-white' : 'text-neutral-400'} 
              />
              <span>Dashboard</span>
            </div>
          </Link>
        </div>

        {/* Bloque: Ventas y Operaciones */}
        <div>
          <div className="space-y-0.5">
            {visibleOperations.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-all duration-150 ${
                    isActive
                      ? 'bg-[#de2a2a] text-white font-semibold shadow-xs'
                      : 'text-neutral-400 hover:bg-white/10 hover:text-white font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon 
                      size={16.5} 
                      className={isActive ? 'text-white' : 'text-neutral-400'} 
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive 
                        ? 'bg-black/25 text-white' 
                        : 'bg-neutral-900 text-neutral-300 border border-[#262626]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bloque: Mantenimiento / Catálogo (Exclusivo SUPER_ADMIN) */}
        {isSuperAdmin && (
          <>
            <div className="border-t border-[#262626] py-0.5" />
            <div>
              <div className="px-2 mb-1 text-[0.6rem] font-bold text-neutral-500 uppercase tracking-wider">
                Catálogo Central
              </div>
              <div className="space-y-0.5">
                {catalogLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-all duration-150 ${
                        isActive
                          ? 'bg-[#de2a2a] text-white font-semibold shadow-xs'
                          : 'text-neutral-400 hover:bg-white/10 hover:text-white font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon 
                          size={16.5} 
                          className={isActive ? 'text-white' : 'text-neutral-400'} 
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive 
                            ? 'bg-black/25 text-white' 
                            : 'bg-neutral-900 text-neutral-300 border border-[#262626]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Bloque: Otros / Configuración (Super Admin y Admin) */}
        {!isSeller && (
          <>
            <div className="border-t border-[#262626] py-0.5" />
            <div>
              <div className="px-2 mb-1 text-[0.6rem] font-bold text-neutral-500 uppercase tracking-wider">
                Configuración
              </div>
              <div className="space-y-0.5">
                {otherLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-all duration-150 ${
                        isActive
                          ? 'bg-[#de2a2a] text-white font-semibold shadow-xs'
                          : 'text-neutral-400 hover:bg-white/10 hover:text-white font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon 
                          size={16.5} 
                          className={isActive ? 'text-white' : 'text-neutral-400'} 
                        />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </nav>
    </div>
  );
}

export function Sidebar() {
  const { isMobileSidebarOpen, closeMobileSidebar } = useAdminNavStore();

  return (
    <>
      {/* 1. Sidebar Fijo para Escritorio (>= lg) */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-black border-r border-[#262626] fixed inset-y-0 left-0 z-30 h-screen">
        <SidebarInner />
      </aside>

      {/* 2. Drawer Móvil Deslizante (< lg) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop con desenfoque suave */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />

          {/* Drawer contenedor que se desliza desde la izquierda */}
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-[#262626] shadow-2xl animate-in slide-in-from-left duration-200 h-screen">
            <SidebarInner onClose={closeMobileSidebar} />
          </aside>
        </div>
      )}
    </>
  );
}

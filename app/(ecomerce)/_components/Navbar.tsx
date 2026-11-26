'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  TbSearch, 
  TbTruckDelivery, 
  TbShoppingCart, 
  TbMenu2, 
  TbBell, 
  TbBuildingStore, 
  TbHeart,
  TbTag,
  TbPackage,
  TbChevronRight,
} from 'react-icons/tb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton
} from '@clerk/nextjs';
import { CategoriesDropdown } from './CategoriesDropdown';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import { PredictiveSearchBar } from './PredictiveSearchBar';
import { useAuthStore } from '@/stores/auth.store';
import { useCompanyStore } from '@/stores/company.store';
import { useCartStore } from '@/stores/cart.store';
import { useFavoritesStore } from '@/stores/favorites.store';
import { getMyOrders } from '@/services/order.service';
import { Order } from '@/types/order.types';

export const Navbar = () => {
  const pathname = usePathname();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { currentUser } = useAuthStore();
  const { company, fetchCompany } = useCompanyStore();
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const openDrawer = useCartStore((state) => state.openDrawer);
  const totalFavorites = useFavoritesStore((state) => state.favoriteIds.length);

  const loadCustomerOrders = useCallback(async () => {
    if (!currentUser?.email) {
      setMyOrders([]);
      return;
    }
    try {
      const data = await getMyOrders();
      setMyOrders(data.slice(0, 3));
    } catch {
      setMyOrders([]);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    setMounted(true);
    fetchCompany(true);
  }, [fetchCompany]);

  useEffect(() => {
    loadCustomerOrders();
  }, [loadCustomerOrders]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const canAccessSalesPanel = Boolean(
    currentUser && ['admin', 'super_admin', 'seller'].includes(currentUser.role)
  );

  return (
    <header className="w-full sticky top-0 z-40 bg-black text-white border-b border-[#262626]">
      {/* Fila principal */}
      <div className="w-full py-5 sm:py-6 bg-black">
        <div className="max-w-7xl mx-auto px-4 md:px-7 relative">

        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white text-[#020202] flex flex-col animate-in fade-in duration-150">
            <PredictiveSearchBar
              isMobileModal={true}
              onCloseMobile={() => setIsMobileSearchOpen(false)}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-4 md:gap-6">
          {/* Izquierda: Menú móvil + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden p-1.5 -ml-1 text-white hover:bg-white/10 cursor-pointer transition-colors"
            >
              <TbMenu2 size={24} />
            </button>

            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              {company?.logoUrl && (
                <div className="h-8 sm:h-9 flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={company.logoUrl}
                    alt={company.name || 'Logo'}
                    className="h-full w-auto object-contain"
                  />
                </div>
              )}
              <span className="font-display text-white font-bold uppercase text-lg md:text-2xl tracking-[0.08em] truncate max-w-[180px] sm:max-w-[260px]">
                {company?.name || 'Cooperativa Gourmet'}
              </span>
            </Link>
          </div>

          {/* Centro: Buscador predictivo escritorio */}
          <div className="hidden md:flex flex-1 justify-center max-w-lg lg:max-w-xl px-4">
            <PredictiveSearchBar />
          </div>

          {/* Derecha: Acciones */}
          <div className="flex items-center gap-2 sm:gap-3.5 text-xs text-white shrink-0">
            {/* Lupa móvil */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Buscar"
              className="md:hidden p-2 hover:bg-white/10 text-white cursor-pointer transition-colors"
            >
              <TbSearch size={20} />
            </button>

            <Show when="signed-out">
              <div className="hidden sm:flex items-center gap-3">
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="hover:text-[#de2a2a] font-semibold uppercase tracking-wider text-[11px] cursor-pointer transition-colors"
                  >
                    Regístrate
                  </button>
                </SignUpButton>

                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-white text-black hover:bg-[#de2a2a] hover:text-white font-bold uppercase tracking-wider text-[11px] cursor-pointer transition-colors"
                  >
                    Ingresa
                  </button>
                </SignInButton>
              </div>
            </Show>

            <Show when="signed-in">
              {canAccessSalesPanel && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-[#de2a2a] border border-white/20 hover:border-[#de2a2a] p-2 lg:px-3 lg:py-1.5 transition-colors cursor-pointer"
                  aria-label="Panel de ventas"
                >
                  <TbBuildingStore size={16} />
                  <span className="hidden lg:inline">Panel</span>
                </Link>
              )}

              <Link
                href="/favoritos"
                className="p-2 hover:text-[#de2a2a] relative transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Favoritos"
              >
                <TbHeart size={20} />
                {mounted && totalFavorites > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#de2a2a] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full leading-none">
                    {totalFavorites > 99 ? '99+' : totalFavorites}
                  </span>
                )}
              </Link>

              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-8 h-8 ring-1 ring-white/30',
                  },
                }}
              />
            </Show>

            {/* Notificaciones */}
            <div className="relative hidden md:block" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  const next = !notifOpen;
                  setNotifOpen(next);
                  if (next) loadCustomerOrders();
                }}
                aria-label="Notificaciones"
                className="p-2 hover:text-[#de2a2a] text-white relative transition-colors cursor-pointer"
              >
                <TbBell size={20} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#de2a2a] rounded-full" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-[#020202] shadow-2xl border border-[#d9d9d9] overflow-hidden z-50 text-left font-normal animate-in fade-in duration-150">
                  <div className="px-4 py-3 bg-black text-white flex items-center justify-between">
                    <span className="text-xs font-display font-bold uppercase tracking-wider">
                      Notificaciones
                    </span>
                    <Link
                      href="/mis-compras"
                      onClick={() => setNotifOpen(false)}
                      className="text-[11px] font-semibold text-[#de2a2a] hover:underline"
                    >
                      Ver mis compras
                    </Link>
                  </div>

                  <div className="divide-y divide-[#e5e5e5] max-h-80 overflow-y-auto">
                    {myOrders.map((ord) => (
                      <Link
                        key={ord.id}
                        href={`/rastreo?order=${encodeURIComponent(ord.orderNumber)}`}
                        onClick={() => setNotifOpen(false)}
                        className="p-3.5 hover:bg-neutral-50 flex items-start gap-3 transition-colors"
                      >
                        <div className="p-2 bg-neutral-100 text-black shrink-0 mt-0.5">
                          <TbPackage size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-black truncate">
                            Pedido #{ord.orderNumber}
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            Estado:{' '}
                            <strong className="text-black">
                              {ord.orderStatus === 'delivered'
                                ? 'Entregado'
                                : ord.orderStatus === 'shipping'
                                  ? 'En camino'
                                  : ord.orderStatus === 'preparing'
                                    ? 'En preparación'
                                    : 'Recibido'}
                            </strong>
                          </p>
                        </div>
                        <TbChevronRight size={15} className="text-neutral-400 self-center shrink-0" />
                      </Link>
                    ))}

                    <Link
                      href="/ofertas"
                      onClick={() => setNotifOpen(false)}
                      className="p-3.5 hover:bg-neutral-50 flex items-start gap-3 transition-colors"
                    >
                      <div className="p-2 bg-[#fff5f5] text-[#de2a2a] shrink-0 mt-0.5">
                        <TbTag size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-black">
                          Ofertas de Nuestra Cooperativa
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Descubre promociones activas con envío a todo el Perú.
                        </p>
                      </div>
                      <TbChevronRight size={15} className="text-neutral-400 self-center shrink-0" />
                    </Link>

                    <Link
                      href="/rastreo"
                      onClick={() => setNotifOpen(false)}
                      className="p-3.5 hover:bg-neutral-50 flex items-start gap-3 transition-colors"
                    >
                      <div className="p-2 bg-neutral-100 text-black shrink-0 mt-0.5">
                        <TbTruckDelivery size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-black">
                          Rastrea tu Pedido en Línea
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Consulta el estado de tu delivery y descarga tu comprobante SUNAT.
                        </p>
                      </div>
                      <TbChevronRight size={15} className="text-neutral-400 self-center shrink-0" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Botón Carrito (abre Mini-Carrito lateral) */}
            <button
              type="button"
              onClick={openDrawer}
              className="flex items-center gap-2 px-2.5 py-2 hover:bg-white/10 text-white relative transition-colors cursor-pointer"
              aria-label="Abrir carrito de compras"
            >
              <TbShoppingCart size={21} />
              <span className="hidden lg:inline text-[11px] font-bold uppercase tracking-wider">
                Carrito
              </span>
              {mounted && totalCartItems > 0 && (
                <span className="bg-[#de2a2a] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full leading-none">
                  {totalCartItems > 99 ? '99+' : totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Barra inferior de categorías (Desktop) */}
      <div className="hidden lg:block bg-black border-t border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 md:px-7">
          <nav className="flex items-center justify-between h-12 gap-4">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className={`text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  pathname === '/'
                    ? 'text-[#de2a2a]'
                    : 'text-white hover:text-[#de2a2a]'
                }`}
              >
                INICIO
              </Link>

              <CategoriesDropdown
                isActive={
                  pathname === '/categories' || pathname.startsWith('/category/')
                }
              />

              <Link
                href="/ofertas"
                className={`text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  pathname.startsWith('/ofertas')
                    ? 'text-[#de2a2a]'
                    : 'text-white hover:text-[#de2a2a]'
                }`}
              >
                OFERTAS
              </Link>
              <Link
                href="/brands"
                className={`text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  pathname === '/brands' || pathname.startsWith('/brand/')
                    ? 'text-[#de2a2a]'
                    : 'text-white hover:text-[#de2a2a]'
                }`}
              >
                MARCAS
              </Link>
            </div>

            <div className="flex items-center gap-5 shrink-0">
              <Link
                href="/historial"
                className={`text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  pathname.startsWith('/historial')
                    ? 'text-[#de2a2a]'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Historial
              </Link>
              <Link
                href="/mis-compras"
                className={`text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  pathname.startsWith('/mis-compras')
                    ? 'text-[#de2a2a]'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Mis compras
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

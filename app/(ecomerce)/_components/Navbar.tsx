'use client';

import React, { useState } from 'react';
import { 
  TbSearch, 
  TbTruckDelivery, 
  TbShoppingCart, 
  TbMenu2, 
  TbBell, 
  TbBuildingStore, 
  TbHeart 
} from 'react-icons/tb';
import Link from 'next/link';
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

export const Navbar = () => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currentUser } = useAuthStore();
  const { company, fetchCompany } = useCompanyStore();
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const totalFavorites = useFavoritesStore((state) => state.favoriteIds.length);

  React.useEffect(() => {
    setMounted(true);
    fetchCompany(true);
  }, [fetchCompany]);

  const canAccessSalesPanel = Boolean(
    currentUser && ['admin', 'super_admin', 'seller'].includes(currentUser.role)
  );

  return (
    <header 
      className="w-full py-2 shadow-sm relative z-50 bg-brand transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-7 relative">

        {/* 1. Mobile Search Overlay (se despliega a pantalla completa al tocar la lupa) */}
        {isMobileSearchOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-150">
            <PredictiveSearchBar
              isMobileModal={true}
              onCloseMobile={() => setIsMobileSearchOpen(false)}
            />
          </div>
        )}

        {/* 2. Layout Grid: 2 filas x 3 columnas (Col 1: Auto, Col 2: 1fr alineado a la izquierda, Col 3: Auto derecha) */}
        <div className="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] items-center gap-x-3 md:gap-x-6 lg:gap-x-8 gap-y-1.5">

          {/* FILA 1, COLUMNA 1: Logo & Botón Menú Móvil */}
          <div className="col-start-1 row-start-1 flex items-center gap-1 sm:gap-2 h-9">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden p-1.5 -ml-1 text-gray-800 hover:bg-black/5 rounded-md cursor-pointer transition-colors"
            >
              <TbMenu2 size={24} />
            </button>

            <Link href="/" className="flex items-center gap-2 min-w-0">
              {company?.logoUrl && (
                <div className="h-7.5 sm:h-7.7 md:h-7.5 flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={company.logoUrl} 
                    alt={company.name || 'Logo'} 
                    className="h-full w-auto object-contain" 
                  />
                </div>
              )}
              <span className="text-[#333] font-bold text-lg md:text-2xl tracking-tighter truncate max-w-[150px] sm:max-w-[190px] md:max-w-[240px]">
                {company?.name || 'Mercado Libre'}
              </span>
            </Link>
          </div>

          {/* FILA 1, COLUMNA 2: Buscador de escritorio predictivo */}
          <div className="col-start-2 row-start-1 hidden md:flex items-center w-full max-w-xl lg:max-w-2xl justify-self-start h-9">
            <PredictiveSearchBar />
          </div>

          {/* FILA 1, COLUMNA 3: Acciones superiores (Lupa móvil, Carrito móvil, Autenticación / Perfil) */}
          <div className="col-start-3 row-start-1 flex items-center gap-2 md:gap-4 text-[13px] text-[#333] h-9 justify-self-end">
            {/* Botón Lupa en Móvil */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Buscar"
              className="md:hidden p-1.5 rounded-full hover:bg-black/5 text-[#333] cursor-pointer transition-colors relative group"
            >
              <TbSearch size={21} className="transition-transform group-hover:scale-110" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                Buscar
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-slate-900"></span>
              </span>
            </button>

            {/* Carrito en Móvil */}
            <Link
              href="/cart"
              className="md:hidden p-1.5 rounded-full hover:bg-black/5 text-[#333] relative transition-colors inline-flex items-center justify-center cursor-pointer"
              aria-label="Carrito de compras"
            >
              <TbShoppingCart size={21} />
              {mounted && totalCartItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#3483fa] text-white text-[10px] font-bold h-3.5 min-w-[14px] px-0.5 flex items-center justify-center rounded-full leading-none animate-in zoom-in-50 duration-150">
                  {totalCartItems > 99 ? '99+' : totalCartItems}
                </span>
              )}
            </Link>

            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button type="button" className="hover:text-black font-normal text-xs md:text-[13px] cursor-pointer">
                  Crea tu cuenta
                </button>
              </SignUpButton>

              <SignInButton mode="modal">
                <button type="button" className="hover:text-black font-normal text-xs md:text-[13px] cursor-pointer">
                  Ingresa
                </button>
              </SignInButton>
            </Show>

            <Show when="signed-in">
              {canAccessSalesPanel && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-xs font-medium text-[#333] bg-white/70 hover:bg-white border border-black/10 p-2 lg:px-3 lg:py-1.5 rounded-full shadow-2xs hover:shadow-xs transition-all duration-200 relative group cursor-pointer"
                  aria-label="Panel de ventas"
                >
                  <TbBuildingStore size={17} className="text-gray-700 transition-transform group-hover:scale-110" />
                  <span className="hidden lg:inline">Panel de ventas</span>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                    Panel de ventas
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-slate-900"></span>
                  </span>
                </Link>
              )}

              <Link
                href="/favoritos"
                className="p-2 rounded-full hover:bg-black/5 text-[#333] hover:text-rose-600 relative transition-all duration-200 group flex items-center justify-center cursor-pointer"
                aria-label="Favoritos"
              >
                <TbHeart size={21} className="transition-transform group-hover:scale-110" />
                {mounted && totalFavorites > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold h-3.5 min-w-[14px] px-0.5 flex items-center justify-center rounded-full leading-none animate-in zoom-in-50 duration-150">
                    {totalFavorites > 99 ? '99+' : totalFavorites}
                  </span>
                )}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                  Favoritos
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-slate-900"></span>
                </span>
              </Link>

              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8"
                  }
                }}
              />
            </Show>
          </div>

          {/* FILA 2, COLUMNA 1: Rastreo de compra (Ancho automático) */}
          <div className="col-start-1 row-start-2 hidden lg:flex items-center">
            <Link href="/rastreo" className="inline-flex items-center gap-1.5 cursor-pointer hover:border-black/20 border border-transparent px-1.5 py-0.5 rounded transition-colors" title="Rastrea tu pedido en tiempo real">
              <TbTruckDelivery size={18} className="text-gray-600 shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-gray-600 text-[11px] truncate">¿Dónde está tu compra?</span>
                <span className="font-medium text-[#333] text-[12px] truncate">Rastrea tu pedido</span>
              </div>
            </Link>
          </div>

          {/* FILA 2, COLUMNA 2: Menú de categorías y enlaces (Alineados en la misma vertical exacta que el buscador) */}
          <nav className="col-start-2 row-start-2 hidden lg:flex items-center gap-4 text-[13px] text-[#333] font-light justify-self-start py-0.5">
            <CategoriesDropdown />
            <Link href="/ofertas" className="hover:text-[#3483fa] transition-colors">Ofertas</Link>
            <Link href="/historial" className="hover:text-[#3483fa] transition-colors">Historial</Link>
            <Link href="/vender" className="hover:text-[#3483fa] transition-colors">Vender</Link>
            <Link href="/ayuda" className="hover:text-[#3483fa] transition-colors">Ayuda</Link>
          </nav>

          {/* FILA 2, COLUMNA 3: Acciones inferiores (Mis compras, Notificaciones, Carrito en escritorio) */}
          <div className="col-start-3 row-start-2 hidden md:flex items-center gap-4 text-[13px] text-[#333] font-light justify-self-end py-0.5">
            <Link href="/mis-compras" className="hover:text-[#3483fa] font-normal transition-colors">
              Mis compras
            </Link>

            <button
              type="button"
              aria-label="Notificaciones"
              className="p-1.5 rounded-full hover:bg-black/5 text-[#333] relative transition-colors cursor-pointer group"
            >
              <TbBell size={19} className="transition-transform group-hover:scale-110" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00a650] rounded-full"></span>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                Notificaciones
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-slate-900"></span>
              </span>
            </button>

            {/* Carrito */}
            <Link
              href="/cart"
              className="p-1.5 rounded-full hover:bg-black/5 text-[#333] relative transition-colors inline-flex items-center justify-center cursor-pointer group"
              aria-label="Carrito de compras"
            >
              <TbShoppingCart size={20} className="transition-transform group-hover:scale-110" />
              {mounted && totalCartItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#3483fa] text-white text-[10px] font-bold h-3.5 min-w-[14px] px-0.5 flex items-center justify-center rounded-full leading-none animate-in zoom-in-50 duration-150">
                  {totalCartItems > 99 ? '99+' : totalCartItems}
                </span>
              )}
              <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                Carrito
                <span className="absolute -top-1 right-3 border-x-4 border-x-transparent border-b-4 border-b-slate-900"></span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Mobile & Tablet Drawer Menu */}
      <MobileMenuDrawer 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </header>
  );
};

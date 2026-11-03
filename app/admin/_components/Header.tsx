'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  TbBell, 
  TbBuildingStore, 
  TbMenu2,
  TbBuilding
} from 'react-icons/tb';
import { UserButton, Show } from '@clerk/nextjs';
import { useAdminNavStore } from '@/stores/admin-nav.store';
import { useCompanyStore } from '@/stores/company.store';

export function Header() {
  const { toggleMobileSidebar } = useAdminNavStore();
  const { company, fetchCompany } = useCompanyStore();

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

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

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative p-2 text-gray-900 hover:text-black hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
        >
          <TbBell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full border border-brand" />
        </button>

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

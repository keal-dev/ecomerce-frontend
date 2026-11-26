'use client';

import React from 'react';
import Link from 'next/link';
import {
  TbChevronRight,
  TbTools,
  TbBuildingStore,
  TbArrowLeft,
  TbFlame,
  TbShieldCheck,
  TbTruckDelivery,
  TbBolt,
} from 'react-icons/tb';

export default function VenderPage() {
  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-500 mb-6">
          <Link href="/" className="hover:text-brand-accent transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-neutral-400" />
          <span className="text-black font-bold">Aliados</span>
        </nav>

        {/* Tarjeta Principal de Próximamente */}
        <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-8 sm:p-14 text-center">
          {/* Insignia superior */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-none text-[11px] font-bold uppercase tracking-widest mb-6">
            <TbTools size={14} className="text-brand-accent" />
            <span>Próximamente</span>
          </div>

          {/* Icono central */}
          <div className="w-20 h-20 bg-black text-white rounded-none flex items-center justify-center mx-auto mb-5 border-b-4 border-brand-accent">
            <TbBuildingStore size={42} />
          </div>

          {/* Título principal */}
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black">
            Estamos trabajando en esto
          </h1>

          <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-brand-accent mt-2">
            Esta sección aún no está disponible
          </p>

          <p className="text-xs sm:text-sm text-neutral-600 mt-2.5 max-w-lg mx-auto leading-relaxed">
            Nuestro portal de venta directa está enfocado actualmente en ofrecerte nuestros vinos, chocolates, derivados del cacao y café de origen con delivery rápido.
          </p>

          {/* Teaser */}
          <div className="mt-8 pt-8 border-t border-[#d9d9d9] grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-none bg-white border border-[#d9d9d9]">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center mb-2.5">
                <TbBolt size={18} />
              </div>
              <h3 className="font-display text-xs font-extrabold uppercase text-black">
                Catálogo curado
              </h3>
              <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                Selección directa de productores asociados de nuestra cooperativa.
              </p>
            </div>

            <div className="p-4 rounded-none bg-white border border-[#d9d9d9]">
              <div className="w-8 h-8 rounded-none bg-[#2e9e7b] text-white flex items-center justify-center mb-2.5">
                <TbShieldCheck size={18} />
              </div>
              <h3 className="font-display text-xs font-extrabold uppercase text-black">
                Pagos protegidos
              </h3>
              <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                Transacciones seguras con tarjetas, Yape y Plin.
              </p>
            </div>

            <div className="p-4 rounded-none bg-white border border-[#d9d9d9]">
              <div className="w-8 h-8 rounded-none bg-brand-accent text-white flex items-center justify-center mb-2.5">
                <TbTruckDelivery size={18} />
              </div>
              <h3 className="font-display text-xs font-extrabold uppercase text-black">
                Delivery express
              </h3>
              <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                Seguimiento en tiempo real para todos tus pedidos.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-accent hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-none transition-colors"
            >
              <TbArrowLeft size={16} />
              <span>Volver al inicio</span>
            </Link>

            <Link
              href="/ofertas"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-black bg-white hover:bg-black hover:text-white text-black text-xs font-bold uppercase tracking-widest rounded-none transition-colors"
            >
              <TbFlame size={16} className="text-brand-accent" />
              <span>Explorar ofertas</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

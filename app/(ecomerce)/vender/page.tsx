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
    <div className="min-h-screen pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 font-light">
          <Link href="/" className="hover:text-[#3483fa] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-800 font-medium">Vender</span>
        </nav>

        {/* Tarjeta Principal de Próximamente */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-8 sm:p-14 text-center overflow-hidden relative">
          {/* Fondo sutil decorativo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-b from-[#fff059]/20 to-transparent blur-2xl pointer-events-none" />

          {/* Insignia superior */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold mb-6">
            <TbTools size={15} className="text-amber-600 animate-pulse" />
            <span>En desarrollo</span>
          </div>

          {/* Icono central */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-100 to-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner border border-amber-200/60">
            <TbBuildingStore size={48} className="text-gray-800" />
          </div>

          {/* Título principal */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Estamos trabajando en esto
          </h1>

          {/* Subtítulo solicitado explícitamente */}
          <p className="text-base sm:text-lg font-medium text-[#3483fa] mt-2">
            Esta página aún no está disponible
          </p>

          <p className="text-xs sm:text-sm text-gray-500 mt-2.5 max-w-lg mx-auto leading-relaxed font-light">
            Estamos preparando la mejor experiencia para que puedas publicar tus artículos, gestionar tus ventas y alcanzar a miles de compradores en todo el país.
          </p>

          {/* Teaser de características que vendrán */}
          <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#3483fa] flex items-center justify-center mb-2.5">
                <TbBolt size={18} />
              </div>
              <h3 className="text-xs font-bold text-gray-800">Publica en segundos</h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Herramientas intuitivas para subir y catalogar tu inventario al instante.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                <TbShieldCheck size={18} />
              </div>
              <h3 className="text-xs font-bold text-gray-800">Cobros protegidos</h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Seguridad garantizada para recibir tus ganancias puntualmente.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5">
                <TbTruckDelivery size={18} />
              </div>
              <h3 className="text-xs font-bold text-gray-800">Envíos organizados</h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Logística fácil y trazabilidad en tiempo real para tus clientes.
              </p>
            </div>
          </div>

          {/* Botones de acción para no dejar al usuario en un callejón sin salida */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3483fa] hover:bg-[#2968c8] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <TbArrowLeft size={16} />
              <span>Volver al inicio</span>
            </Link>

            <Link
              href="/ofertas"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-medium rounded-xl transition-colors"
            >
              <TbFlame size={16} className="text-[#00a650]" />
              <span>Explorar ofertas</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

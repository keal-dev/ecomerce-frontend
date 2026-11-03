'use client';

import React from 'react';
import { TbFlame, TbBolt, TbTruckDelivery, TbTag, TbPercentage } from 'react-icons/tb';

interface DealsHeroBannerProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  totalDealsCount: number;
}

export function DealsHeroBanner({
  activeTab,
  onTabChange,
  totalDealsCount,
}: DealsHeroBannerProps) {
  const quickFilters = [
    { id: 'all', label: 'Todas las ofertas', icon: TbTag },
    { id: '40plus', label: '40% OFF o más', icon: TbFlame, badge: 'Top Ahorro' },
    { id: '20to40', label: '20% a 40% OFF', icon: TbPercentage },
    { id: 'free_shipping', label: 'Con Envío Gratis', icon: TbTruckDelivery },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white shadow-md p-6 sm:p-8 mb-6">
      {/* Círculos decorativos de fondo */}
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
          <TbBolt size={14} className="text-amber-300 animate-pulse" />
          <span>Descuentos Exclusivos</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
          Ofertas y Precios Especiales
        </h1>
        <p className="text-sm sm:text-base text-blue-100 max-w-xl font-normal mb-6">
          Aprovecha los mejores descuentos en productos seleccionados. {totalDealsCount} {totalDealsCount === 1 ? 'oferta activa' : 'ofertas activas'} disponibles hoy con stock inmediato.
        </p>

        {/* Pestañas de Filtro Rápido */}
        <div className="flex flex-wrap items-center gap-2">
          {quickFilters.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                  isActive
                    ? 'bg-white text-blue-900 shadow-md scale-102'
                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-blue-600' : 'text-blue-200'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? 'bg-amber-100 text-amber-800' : 'bg-amber-400 text-slate-900'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
    { id: '40plus', label: '40% OFF o más', icon: TbFlame, badge: 'TOP AHORRO' },
    { id: '20to40', label: '20% a 40% OFF', icon: TbPercentage },
    { id: 'free_shipping', label: 'Con Envío Gratis', icon: TbTruckDelivery },
  ];

  return (
    <div className="relative overflow-hidden rounded-none bg-black text-white border-b-4 border-[#de2a2a] p-6 sm:p-8 mb-6">
      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-[#de2a2a] text-[11px] font-bold uppercase tracking-[0.2em] mb-2">
          <TbBolt size={14} className="text-[#de2a2a]" />
          <span>Promociones Exclusivas</span>
        </div>

        <h1 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mb-2">
          Promos & Precios Especiales
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-xl font-normal mb-6">
          Aprovecha nuestros mejores descuentos en vinos, chocolates, derivados del cacao, café y packs seleccionados.{' '}
          {totalDealsCount} {totalDealsCount === 1 ? 'promo activa' : 'promos activas'} hoy con stock inmediato.
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
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#de2a2a] text-white'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-[#262626] hover:border-white'
                }`}
              >
                <Icon size={15} className="text-white" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-none font-extrabold bg-[#f3ff34] text-black">
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

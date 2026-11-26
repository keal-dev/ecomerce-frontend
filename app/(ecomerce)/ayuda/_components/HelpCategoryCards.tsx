'use client';

import React from 'react';
import {
  TbTruckDelivery,
  TbCreditCard,
  TbShieldCheck,
  TbUserCheck,
} from 'react-icons/tb';

export type HelpCategoryType = 'all' | 'shipping' | 'payments' | 'returns' | 'account';

interface HelpCategoryCardsProps {
  selectedCategory: HelpCategoryType;
  onSelectCategory: (cat: HelpCategoryType) => void;
}

const CATEGORIES = [
  {
    id: 'shipping' as HelpCategoryType,
    title: 'Compras y Delivery',
    description: 'Seguimiento, plazos de entrega, envíos gratis y EXPRESS',
    icon: TbTruckDelivery,
  },
  {
    id: 'payments' as HelpCategoryType,
    title: 'Pagos y Facturación',
    description: 'Tarjetas, Yape/Plin, boletas y facturas electrónicas',
    icon: TbCreditCard,
  },
  {
    id: 'returns' as HelpCategoryType,
    title: 'Garantía y Devolución',
    description: 'Autenticidad, plazos y cómo solicitar reembolsos',
    icon: TbShieldCheck,
  },
  {
    id: 'account' as HelpCategoryType,
    title: 'Cuenta y Seguridad',
    description: 'Actualización de datos, contraseñas y privacidad',
    icon: TbUserCheck,
  },
];

export const HelpCategoryCards = ({
  selectedCategory,
  onSelectCategory,
}: HelpCategoryCardsProps) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg sm:text-xl font-extrabold uppercase tracking-tight text-black">
          Explora por temas frecuentes
        </h2>
        {selectedCategory !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="text-xs font-bold uppercase tracking-wider text-brand-accent hover:underline cursor-pointer"
          >
            Ver todos los temas
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
              className={`p-5 rounded-none border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-brand-accent ring-1 ring-brand-accent bg-[#f8f8f8]'
                  : 'bg-white border-[#d9d9d9] hover:border-black'
              }`}
            >
              <div>
                <div
                  className={`w-11 h-11 rounded-none flex items-center justify-center mb-3 border transition-colors ${
                    isSelected
                      ? 'bg-brand-accent text-white border-brand-accent'
                      : 'bg-[#f8f8f8] text-black border-[#d9d9d9]'
                  }`}
                >
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-sm font-extrabold uppercase text-black leading-snug">
                  {cat.title}
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <span
                className={`mt-4 text-[11px] font-bold uppercase tracking-wider inline-flex items-center ${
                  isSelected ? 'text-brand-accent' : 'text-neutral-500'
                }`}
              >
                {isSelected ? '✓ Tema filtrado' : 'Ver preguntas →'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

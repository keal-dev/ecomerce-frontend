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
    title: 'Compras y Envíos',
    description: 'Seguimiento, plazos de entrega, envíos gratis y FULL',
    icon: TbTruckDelivery,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    activeRing: 'ring-2 ring-blue-500 border-blue-500',
  },
  {
    id: 'payments' as HelpCategoryType,
    title: 'Pagos y Facturación',
    description: 'Tarjetas, transferencias, boletas y facturas electrónicas',
    icon: TbCreditCard,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    activeRing: 'ring-2 ring-emerald-500 border-emerald-500',
  },
  {
    id: 'returns' as HelpCategoryType,
    title: 'Garantía y Devolución',
    description: 'Compra Protegida, plazos y cómo solicitar reembolsos',
    icon: TbShieldCheck,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    activeRing: 'ring-2 ring-amber-500 border-amber-500',
  },
  {
    id: 'account' as HelpCategoryType,
    title: 'Cuenta y Seguridad',
    description: 'Actualización de datos, contraseñas y privacidad',
    icon: TbUserCheck,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    activeRing: 'ring-2 ring-purple-500 border-purple-500',
  },
];

export const HelpCategoryCards = ({
  selectedCategory,
  onSelectCategory,
}: HelpCategoryCardsProps) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          Explora por temas frecuentes
        </h2>
        {selectedCategory !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="text-xs font-semibold text-[#3483fa] hover:underline cursor-pointer"
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
              className={`p-5 rounded-2xl bg-white border text-left transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? `${cat.activeRing} shadow-md`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 border ${cat.color}`}
                >
                  <Icon size={24} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-snug">
                  {cat.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed font-light">
                  {cat.description}
                </p>
              </div>

              <span
                className={`mt-4 text-[11px] font-semibold inline-flex items-center ${
                  isSelected ? 'text-[#3483fa]' : 'text-gray-400 group-hover:text-gray-600'
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

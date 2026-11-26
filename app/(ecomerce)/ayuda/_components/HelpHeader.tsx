'use client';

import React from 'react';
import { TbSearch, TbX } from 'react-icons/tb';

interface HelpHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectQuickTag: (tag: string) => void;
  onSearchSubmit: () => void;
}

const QUICK_TAGS = [
  'Rastrear mi pedido',
  'Devoluciones y reembolsos',
  'Medios de pago',
  'Factura electrónica',
  'Costos de envío',
];

export const HelpHeader = ({
  searchQuery,
  onSearchChange,
  onSelectQuickTag,
  onSearchSubmit,
}: HelpHeaderProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <div className="bg-black text-white rounded-none border-b-4 border-[#de2a2a] p-6 sm:p-10 mb-8 text-center relative overflow-hidden">
      <div className="relative max-w-2xl mx-auto">
        <span className="inline-block text-[11px] font-bold text-[#de2a2a] uppercase tracking-[0.2em] mb-2">
          Centro de Ayuda y Soporte
        </span>
        <h1 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
          ¿Con qué podemos ayudarte hoy?
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-2 font-normal">
          Encuentra respuestas rápidas sobre tus compras, delivery, pagos y garantías.
        </p>

        {/* Formulario de búsqueda interactiva */}
        <form onSubmit={handleSubmit} className="mt-6 relative rounded-none overflow-hidden flex items-center bg-white border border-[#262626]">
          <div className="relative flex-1 flex items-center">
            <TbSearch
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Escribe tu duda (ej. rastrear, devolución, boleta, envíos)..."
              className="w-full pl-12 pr-10 py-3.5 text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-1 cursor-pointer"
              >
                <TbX size={18} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3.5 bg-[#de2a2a] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer shrink-0 rounded-none"
          >
            Buscar
          </button>
        </form>

        {/* Tags sugeridos */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
            Sugerencias:
          </span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectQuickTag(tag)}
              className="text-[11px] bg-neutral-900 hover:bg-[#de2a2a] text-white border border-[#262626] hover:border-[#de2a2a] font-bold px-3 py-1.5 rounded-none transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

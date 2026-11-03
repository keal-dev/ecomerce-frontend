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
    <div className="bg-gradient-to-b from-[#fff059] to-[#ffe600] rounded-2xl shadow-xs p-6 sm:p-10 mb-8 border border-yellow-300/60 text-center relative overflow-hidden">
      {/* Círculos decorativos sutiles */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/20 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-yellow-400/30 rounded-full blur-xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto">
        <span className="inline-block text-xs font-bold text-gray-800 uppercase tracking-widest mb-2 bg-black/5 px-3 py-1 rounded-full">
          Centro de Ayuda y Soporte
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          ¿Con qué podemos ayudarte hoy?
        </h1>
        <p className="text-xs sm:text-sm text-gray-800/80 mt-2 font-normal">
          Encuentra respuestas rápidas sobre tus compras, envíos, pagos y garantías
        </p>

        {/* Formulario de búsqueda interactiva */}
        <form onSubmit={handleSubmit} className="mt-6 relative shadow-lg rounded-xl overflow-hidden flex items-center bg-white">
          <div className="relative flex-1 flex items-center">
            <TbSearch
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Escribe tu duda (ej. rastrear, devolución, boleta, envíos)..."
              className="w-full pl-12 pr-10 py-3.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <TbX size={18} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-3.5 bg-[#3483fa] hover:bg-[#2968c8] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0"
          >
            Buscar
          </button>
        </form>

        {/* Tags sugeridos */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] text-gray-700 font-medium">Sugerencias:</span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectQuickTag(tag)}
              className="text-[11px] bg-white/80 hover:bg-white text-gray-800 font-medium px-2.5 py-1 rounded-full shadow-2xs transition-all hover:scale-105 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

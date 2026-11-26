'use client';

import React, { useState } from 'react';
import { TbSearch, TbTrash, TbX, TbAlertCircle } from 'react-icons/tb';

interface HistoryHeaderProps {
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: 'all' | 'discount' | 'shipping';
  onFilterChange: (filter: 'all' | 'discount' | 'shipping') => void;
  onClearAll: () => void;
}

export const HistoryHeader = ({
  totalCount,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onClearAll,
}: HistoryHeaderProps) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirmClear = () => {
    onClearAll();
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="bg-white rounded-none border border-[#d9d9d9] p-5 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d9d9d9] pb-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-black">
                Historial de navegación
              </h1>
              <span className="bg-black text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-none">
                {totalCount} {totalCount === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Productos que visitaste recientemente en nuestra tienda.
            </p>
          </div>

          {totalCount > 0 && (
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-brand-accent border border-[#d9d9d9] hover:border-brand-accent hover:bg-red-50 rounded-none transition-colors cursor-pointer"
              >
                <TbTrash size={15} />
                <span>Borrar historial</span>
              </button>
            </div>
          )}
        </div>

        {totalCount > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Buscador dentro del historial */}
            <div className="relative flex-1 max-w-md">
              <TbSearch
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar en tu historial..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#f8f8f8] focus:bg-white border border-[#d9d9d9] focus:border-black rounded-none outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-0.5 cursor-pointer"
                >
                  <TbX size={15} />
                </button>
              )}
            </div>

            {/* Píldoras de filtro rápido */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => onFilterChange('all')}
                className={`px-3.5 py-2 rounded-none transition-colors whitespace-nowrap cursor-pointer border ${
                  activeFilter === 'all'
                    ? 'bg-black text-white border-black'
                    : 'bg-[#f8f8f8] text-neutral-700 border-[#d9d9d9] hover:border-black'
                }`}
              >
                Todos ({totalCount})
              </button>

              <button
                type="button"
                onClick={() => onFilterChange('discount')}
                className={`px-3.5 py-2 rounded-none transition-colors whitespace-nowrap cursor-pointer border ${
                  activeFilter === 'discount'
                    ? 'bg-brand-accent text-white border-brand-accent'
                    : 'bg-[#f8f8f8] text-neutral-700 border-[#d9d9d9] hover:border-black'
                }`}
              >
                Con descuento
              </button>

              <button
                type="button"
                onClick={() => onFilterChange('shipping')}
                className={`px-3.5 py-2 rounded-none transition-colors whitespace-nowrap cursor-pointer border ${
                  activeFilter === 'shipping'
                    ? 'bg-black text-white border-black'
                    : 'bg-[#f8f8f8] text-neutral-700 border-[#d9d9d9] hover:border-black'
                }`}
              >
                Envío gratis
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación para borrar historial */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-none max-w-sm w-full p-6 shadow-2xl border border-black">
            <div className="w-11 h-11 rounded-none bg-brand-accent text-white flex items-center justify-center mb-4">
              <TbAlertCircle size={24} />
            </div>
            <h3 className="font-display text-base font-extrabold uppercase text-black">
              ¿Borrar todo el historial?
            </h3>
            <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
              Se eliminarán las {totalCount} publicaciones que visitaste de este dispositivo. Esta acción no se puede deshacer.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-black border border-[#d9d9d9] hover:border-black rounded-none transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-brand-accent hover:bg-red-700 rounded-none transition-colors cursor-pointer"
              >
                Sí, borrar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

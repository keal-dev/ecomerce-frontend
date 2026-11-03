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
  filteredCount,
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
      <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-4 sm:p-5 mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Historial de navegación
              </h1>
              <span className="bg-blue-50 text-[#3483fa] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
                {totalCount} {totalCount === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-light">
              Publicaciones y productos que visitaste recientemente en nuestra tienda
            </p>
          </div>

          {totalCount > 0 && (
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
              >
                <TbTrash size={16} />
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar en tu historial..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#3483fa] rounded-lg outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <TbX size={15} />
                </button>
              )}
            </div>

            {/* Píldoras de filtro rápido */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs font-medium">
              <button
                type="button"
                onClick={() => onFilterChange('all')}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#3483fa] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos ({totalCount})
              </button>

              <button
                type="button"
                onClick={() => onFilterChange('discount')}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === 'discount'
                    ? 'bg-[#00a650] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Con descuento
              </button>

              <button
                type="button"
                onClick={() => onFilterChange('shipping')}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === 'shipping'
                    ? 'bg-[#3483fa] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-100">
            <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <TbAlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              ¿Borrar todo el historial?
            </h3>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed font-light">
              Se eliminarán las {totalCount} publicaciones que visitaste de este dispositivo. Esta acción no se puede deshacer.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
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

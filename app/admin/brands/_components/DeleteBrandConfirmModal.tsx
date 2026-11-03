'use client';

import React from 'react';
import { TbAlertTriangle, TbX, TbTrash, TbLoader2 } from 'react-icons/tb';
import { Brand } from '@/types/brand.types';

interface DeleteBrandConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  brand: Brand | null;
  isLoading?: boolean;
}

export function DeleteBrandConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  brand,
  isLoading = false,
}: DeleteBrandConfirmModalProps) {
  if (!isOpen || !brand) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TbAlertTriangle size={16} />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Eliminar Marca</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <TbX size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            ¿Estás seguro de que deseas eliminar permanentemente la marca{' '}
            <strong className="text-gray-900 font-semibold">{brand.name}</strong>?
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800">
            Esta acción no se puede deshacer. Los productos que pertenezcan a esta marca perderán su asociación.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <TbLoader2 size={14} className="animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <TbTrash size={14} />
                <span>Eliminar Marca</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { TbAlertTriangle, TbTrash, TbX, TbLoader2 } from 'react-icons/tb';
import { Banner } from '@/types/banner.types';

interface DeleteBannerModalProps {
  isOpen: boolean;
  banner: Banner | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteBannerModal({
  isOpen,
  banner,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteBannerModalProps) {
  if (!isOpen || !banner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in zoom-in-95 duration-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TbAlertTriangle size={22} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900">
              ¿Eliminar banner publicitario?
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Estás a punto de eliminar el banner{' '}
              <strong className="text-gray-900 font-semibold">&ldquo;{banner.title}&rdquo;</strong>.
              Dejará de mostrarse inmediatamente en la tienda.
            </p>

            {banner.imageUrl && (
              <div className="mt-3 w-full h-24 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <TbX size={18} />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <TbLoader2 size={15} className="animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <TbTrash size={15} />
                <span>Sí, eliminar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

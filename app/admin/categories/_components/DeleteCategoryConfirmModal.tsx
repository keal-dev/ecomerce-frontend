'use client';

import React, { useState } from 'react';
import { TbAlertTriangle, TbTrash, TbX } from 'react-icons/tb';
import { Category } from '@/types/category.types';

interface DeleteCategoryConfirmModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function DeleteCategoryConfirmModal({
  isOpen,
  category,
  onClose,
  onConfirm,
}: DeleteCategoryConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !category) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm(category.id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar la categoría';
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-full bg-rose-100 text-rose-600 shrink-0">
            <TbAlertTriangle size={24} />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              Eliminar Categoría Físicamente
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              ¿Estás seguro de que deseas eliminar permanentemente la categoría{' '}
              <strong className="text-gray-900 font-semibold">&ldquo;{category.name}&rdquo;</strong>?
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <TbX size={18} />
          </button>
        </div>

        {/* Advertencia física */}
        <div className="mx-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
          <p className="font-semibold">⚠️ Esta acción no se puede deshacer.</p>
          <p className="text-amber-700">
            El registro será eliminado físicamente y por completo de la tabla de la base de datos.
          </p>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Acciones */}
        <div className="mt-5 p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200/70 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <TbTrash size={15} />
                <span>Eliminar Definitivamente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

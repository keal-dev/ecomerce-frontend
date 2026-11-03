'use client';

import React, { useState, useEffect } from 'react';
import { TbAlertTriangle, TbTrash, TbX, TbLoader2, TbAlertCircle } from 'react-icons/tb';
import { User } from '@/types/user.types';

interface DeleteUserConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: () => Promise<void>;
}

export function DeleteUserConfirmModal({
  isOpen,
  onClose,
  user,
  onConfirm,
}: DeleteUserConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setIsDeleting(false);
  }, [isOpen, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const isSuperAdmin = user.role === 'super_admin';

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el usuario';
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <TbAlertTriangle size={24} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-gray-900">
                  Eliminar Usuario
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  <TbX size={18} />
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                ¿Estás seguro de que deseas eliminar al usuario{' '}
                <strong className="text-gray-900 font-semibold">{fullName}</strong>?
              </p>

              {user.email && (
                <div className="mt-2.5 p-2 bg-gray-50 rounded-lg border border-gray-200/60 text-[11px] font-mono text-gray-600">
                  {user.email} • Rol: <span className="font-semibold uppercase">{user.role}</span>
                </div>
              )}

              {isSuperAdmin && (
                <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <TbAlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                  <p>
                    <strong>Precaución:</strong> Este usuario es Super Administrador. Si es el único activo, el sistema no permitirá su eliminación.
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <TbAlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {isDeleting ? (
                <>
                  <TbLoader2 className="animate-spin" size={15} />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <TbTrash size={15} />
                  <span>Confirmar Eliminación</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

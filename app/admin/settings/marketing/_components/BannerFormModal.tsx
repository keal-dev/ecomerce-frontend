'use client';

import React, { useState, useEffect } from 'react';
import {
  TbX,
  TbCheck,
  TbLoader2,
  TbAlertCircle,
  TbLink,
  TbTag,
} from 'react-icons/tb';
import { Banner, UpdateBannerDto } from '@/types/banner.types';

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: Banner | null;
  onSubmit: (order: number, data: UpdateBannerDto) => Promise<void>;
}

export function BannerFormModal({
  isOpen,
  onClose,
  slot,
  onSubmit,
}: BannerFormModalProps) {
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && slot) {
      setTitle(slot.title || (slot.order === 1 ? 'Banner Principal' : `Banner ${slot.order}`));
      setLinkUrl(slot.linkUrl || '');
      setError(null);
    }
  }, [isOpen, slot]);

  if (!isOpen || !slot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      const payload: UpdateBannerDto = {
        title: title.trim() || (slot.order === 1 ? 'Banner Principal' : `Banner ${slot.order}`),
        linkUrl: linkUrl.trim() || null,
      };

      await onSubmit(slot.order, payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los datos del banner.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Encabezado */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {slot.order === 1 ? 'Configurar Banner Principal' : 'Configurar Banner'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configura el nombre y el enlace de redirección.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <TbX size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
              <TbAlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Nombre / Título */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <TbTag size={14} className="text-gray-400" />
              <span>Nombre de la Campaña o Referencia</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                slot.order === 1
                  ? 'Campaña Principal (ej. Cyber Wow)'
                  : 'Ej. Descuento en Laptops'
              }
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#3483fa] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
              autoFocus
            />
          </div>

          {/* Enlace / Slug de Destino (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <TbLink size={14} className="text-gray-400" />
              <span>Enlace / Slug de Destino (Opcional)</span>
            </label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Ej. /categories/tecnologia o /product/laptop-gamer"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#3483fa] focus:ring-2 focus:ring-blue-100 transition-all font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Ruta o URL a la que se dirigirá el cliente al hacer clic sobre el banner.
            </p>
          </div>

          {/* Footer del Modal */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <TbLoader2 size={16} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <TbCheck size={16} />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

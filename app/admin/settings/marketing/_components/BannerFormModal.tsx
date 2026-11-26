'use client';

import React, { useState, useEffect } from 'react';
import {
  TbX,
  TbCheck,
  TbLoader2,
  TbAlertCircle,
  TbLink,
  TbTag,
  TbClick,
  TbArrowRight,
  TbLayoutBottombar,
} from 'react-icons/tb';
import {
  Banner,
  BannerButtonPosition,
  BannerLinkMode,
  UpdateBannerDto,
} from '@/types/banner.types';

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: Banner | null;
  onSubmit: (order: number, data: UpdateBannerDto) => Promise<void>;
}

const POSITION_OPTIONS: { value: BannerButtonPosition; label: string }[] = [
  { value: 'bottom-left', label: 'Abajo izquierda' },
  { value: 'bottom-center', label: 'Abajo centro' },
  { value: 'bottom-right', label: 'Abajo derecha' },
  { value: 'center', label: 'Centro' },
];

function getPreviewOverlayClass(position: BannerButtonPosition): string {
  switch (position) {
    case 'bottom-center':
      return 'items-end justify-center p-3 pb-3.5';
    case 'bottom-right':
      return 'items-end justify-end p-3 pb-3.5';
    case 'center':
      return 'items-center justify-center p-3';
    case 'bottom-left':
    default:
      return 'items-end justify-start p-3 pb-3.5';
  }
}

export function BannerFormModal({
  isOpen,
  onClose,
  slot,
  onSubmit,
}: BannerFormModalProps) {
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkMode, setLinkMode] = useState<BannerLinkMode>('image');
  const [buttonText, setButtonText] = useState('');
  const [buttonPosition, setButtonPosition] = useState<BannerButtonPosition>('bottom-left');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && slot) {
      setTitle(slot.title || (slot.order === 1 ? 'Banner Principal' : `Banner ${slot.order}`));
      setLinkUrl(slot.linkUrl || '');
      setLinkMode(slot.linkMode === 'button' ? 'button' : 'image');
      setButtonText(slot.buttonText || '');
      setButtonPosition(slot.buttonPosition || 'bottom-left');
      setError(null);
    }
  }, [isOpen, slot]);

  if (!isOpen || !slot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      const cleanLink = linkUrl.trim() || null;
      const payload: UpdateBannerDto = {
        title: title.trim() || (slot.order === 1 ? 'Banner Principal' : `Banner ${slot.order}`),
        linkUrl: cleanLink,
        linkMode,
        buttonText: linkMode === 'button' ? (buttonText.trim() || 'Ver más') : null,
        buttonPosition,
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
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Encabezado */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {slot.order === 1 ? 'Configurar Banner Principal' : 'Configurar Banner'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Define el nombre, el enlace y si se muestra un botón sobre la imagen.
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
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
                  ? 'Campaña Principal (ej. Cosecha de Vinos & Cacao)'
                  : 'Ej. Chocolates Finos de Origen'
              }
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-brand-accent transition-all font-medium"
              autoFocus
            />
          </div>

          {/* Enlace / Slug de Destino (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <TbLink size={14} className="text-gray-400" />
              <span>Enlace / Ruta de Destino (Opcional)</span>
            </label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Ej. /ofertas, /category/vinos o /product/vino-reserva"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-brand-accent transition-all font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Si dejas este campo vacío, el banner será solo visual (sin redirección).
            </p>
          </div>

          {/* Modo de Enlace */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <TbClick size={14} className="text-gray-400" />
              <span>Comportamiento del enlace en el carrusel</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setLinkMode('image')}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  linkMode === 'image'
                    ? 'border-[#111111] bg-gray-50 ring-1 ring-[#111111]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-900">Clic en la imagen</span>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      linkMode === 'image' ? 'border-brand-accent bg-brand-accent' : 'border-gray-300'
                    }`}
                  >
                    {linkMode === 'image' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </div>
                <p className="text-[10.5px] text-gray-500 mt-1 leading-snug">
                  Toda la foto es clickeable, sin botones encima.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLinkMode('button')}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  linkMode === 'button'
                    ? 'border-[#111111] bg-gray-50 ring-1 ring-[#111111]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-900">Botón sobre el banner</span>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      linkMode === 'button' ? 'border-brand-accent bg-brand-accent' : 'border-gray-300'
                    }`}
                  >
                    {linkMode === 'button' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </div>
                <p className="text-[10.5px] text-gray-500 mt-1 leading-snug">
                  Solo el botón abre el enlace; la imagen queda limpia.
                </p>
              </button>
            </div>
          </div>

          {/* Opciones del Botón (solo si elige modo botón) */}
          {linkMode === 'button' && (
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Texto del botón
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Ej. Comprar ahora, Ver ofertas, Explorar"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-brand-accent transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <TbLayoutBottombar size={14} className="text-gray-400" />
                  <span>Posición del botón</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {POSITION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setButtonPosition(opt.value)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                        buttonPosition === opt.value
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vista previa compacta sobre la imagen */}
              {slot.imageUrl && (
                <div>
                  <span className="block text-[10.5px] font-semibold text-gray-500 mb-1">
                    Vista previa rápida
                  </span>
                  <div className="relative w-full h-28 rounded-lg overflow-hidden bg-black border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slot.imageUrl}
                      alt={title || 'Vista previa'}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 flex pointer-events-none ${getPreviewOverlayClass(
                        buttonPosition,
                      )}`}
                    >
                      <span className="inline-flex items-center gap-1.5 bg-brand-accent text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 shadow-md">
                        <span>{buttonText.trim() || 'Ver más'}</span>
                        <TbArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!linkUrl.trim() && (
                <p className="text-[11px] text-amber-700 font-medium">
                  Recuerda ingresar arriba el enlace de destino para que el botón aparezca en la tienda.
                </p>
              )}
            </div>
          )}

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
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#111111] hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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

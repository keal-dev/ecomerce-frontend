'use client';

import React, { useState } from 'react';
import { TbCash, TbX, TbLoader2, TbAlertCircle } from 'react-icons/tb';
import { useAuthStore } from '@/stores/auth.store';
import { useCompanyStore } from '@/stores/company.store';
import { useCashRegisterStore } from '@/stores/cash-register.store';

interface OpenCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OpenCashModal({ isOpen, onClose, onSuccess }: OpenCashModalProps) {
  const { currentUser } = useAuthStore();
  const { company } = useCompanyStore();
  const { openSession, isLoading } = useCashRegisterStore();

  const [initialAmount, setInitialAmount] = useState<string>('0.00');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const businessName = company?.name || 'MercadoAdmin';
  const userName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.email || 'Usuario';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser?.id) {
      setError('No se detectó el usuario responsable.');
      return;
    }

    const amountNum = parseFloat(initialAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      setError('Por favor ingresa un monto base inicial válido (mayor o igual a 0).');
      return;
    }

    try {
      await openSession({
        openedById: currentUser.id,
        initialAmount: amountNum,
        notes: notes.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al abrir la caja.';
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TbCash size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">Apertura de Caja</h2>
              <p className="text-[11px] text-gray-400">Iniciar turno operativo del negocio</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <TbX size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <TbAlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Negocio y Responsable */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Negocio / Empresa</span>
              <span className="font-semibold text-gray-800 truncate block mt-0.5">{businessName}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Responsable</span>
              <span className="font-semibold text-gray-800 truncate block mt-0.5">{userName}</span>
            </div>
          </div>

          {/* Monto inicial */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Monto Base Inicial en Efectivo (S/) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                S/
              </span>
              <input
                type="number"
                step="0.10"
                min="0"
                required
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-[#3483fa] focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Dinero disponible en gaveta para dar cambio / vueltos.
            </p>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Observaciones / Notas (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Billetes y monedas de 10, 20 y 50 soles..."
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#3483fa] focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00a650] hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <TbLoader2 size={15} className="animate-spin" />
                  <span>Abriendo...</span>
                </>
              ) : (
                <span>Confirmar y Abrir Caja</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

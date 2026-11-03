'use client';

import React, { useState, useMemo } from 'react';
import { 
  TbLockCheck, 
  TbX, 
  TbLoader2, 
  TbAlertCircle, 
  TbCheck, 
  TbTrendingDown, 
  TbTrendingUp 
} from 'react-icons/tb';
import { useAuthStore } from '@/stores/auth.store';
import { useCashRegisterStore } from '@/stores/cash-register.store';
import { CashSession } from '@/types/cash-register.types';

interface CloseCashModalProps {
  session: CashSession;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CloseCashModal({ session, isOpen, onClose, onSuccess }: CloseCashModalProps) {
  const { currentUser } = useAuthStore();
  const { closeSession, isLoading } = useCashRegisterStore();

  const [actualAmount, setActualAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const expectedAmount = session.expectedAmount ?? session.initialAmount;

  // Cálculo en vivo de la diferencia (arqueo)
  const difference = useMemo(() => {
    const val = parseFloat(actualAmount);
    if (isNaN(val)) return null;
    return val - expectedAmount;
  }, [actualAmount, expectedAmount]);

  if (!isOpen) return null;

  const userName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.email || 'Usuario';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser?.id) {
      setError('No se detectó el usuario responsable del cierre.');
      return;
    }

    const val = parseFloat(actualAmount);
    if (isNaN(val) || val < 0) {
      setError('Por favor ingresa un monto físico contado válido (mayor o igual a 0).');
      return;
    }

    try {
      await closeSession(session.id, {
        closedById: currentUser.id,
        actualAmount: val,
        expectedAmount,
        notes: notes.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cerrar la caja.';
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
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TbLockCheck size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">Cierre y Arqueo de Caja</h2>
              <p className="text-[11px] text-gray-400">Finalizar turno y cuadrar efectivo</p>
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

          {/* Resumen de Apertura */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between items-center text-gray-500">
              <span>Responsable de Cierre:</span>
              <span className="font-semibold text-gray-800">{userName}</span>
            </div>
            <div className="flex justify-between items-center text-gray-500">
              <span>Monto Base Inicial:</span>
              <span className="font-semibold text-gray-800">
                S/ {Number(session.initialAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200/80 font-bold text-gray-900">
              <span>Efectivo Esperado en Caja:</span>
              <span className="text-[#3483fa] text-sm">
                S/ {expectedAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Efectivo físico contado */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Efectivo Físico Contado en Gaveta (S/) <span className="text-rose-500">*</span>
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
                autoFocus
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-[#3483fa] focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Indicador en vivo de diferencia / arqueo */}
          {difference !== null && (
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
              difference === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : difference > 0
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center gap-2">
                {difference === 0 ? (
                  <TbCheck size={16} className="text-emerald-600 shrink-0" />
                ) : difference > 0 ? (
                  <TbTrendingUp size={16} className="text-blue-600 shrink-0" />
                ) : (
                  <TbTrendingDown size={16} className="text-rose-600 shrink-0" />
                )}
                <span className="font-medium">
                  {difference === 0
                    ? '¡Caja cuadrada exactamente!'
                    : difference > 0
                    ? 'Sobrante en caja:'
                    : 'Faltante en caja:'}
                </span>
              </div>
              <span className="font-bold text-sm">
                {difference > 0 ? `+S/ ${difference.toFixed(2)}` : `S/ ${difference.toFixed(2)}`}
              </span>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Motivo o Notas de Cierre (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Cierre de turno tarde. Todo conforme sin incidencias..."
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
              disabled={isLoading || actualAmount === ''}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <TbLoader2 size={15} className="animate-spin" />
                  <span>Cerrando...</span>
                </>
              ) : (
                <span>Confirmar Cierre de Caja</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

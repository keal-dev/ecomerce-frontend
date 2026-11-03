'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  TbBuilding,
  TbCash,
  TbLockCheck,
  TbHistory,
  TbChevronLeft,
  TbCheck,
  TbClock,
  TbUser,
  TbRefresh,
  TbTrendingUp,
  TbTrendingDown,
} from 'react-icons/tb';
import { useAuthStore } from '@/stores/auth.store';
import { useCompanyStore } from '@/stores/company.store';
import { useCashRegisterStore } from '@/stores/cash-register.store';
import { OpenCashModal } from './OpenCashModal';
import { CloseCashModal } from './CloseCashModal';

export function CashRegisterManager() {
  const { currentUser } = useAuthStore();
  const { company, fetchCompany } = useCompanyStore();
  const {
    currentSession,
    history,
    isLoading,
    fetchCurrentSession,
    fetchHistory,
  } = useCashRegisterStore();

  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const businessName = company?.name || 'MercadoAdmin';

  const loadData = useCallback(() => {
    fetchCurrentSession();
    fetchHistory();
  }, [fetchCurrentSession, fetchHistory]);

  useEffect(() => {
    fetchCompany();
    loadData();
  }, [fetchCompany, loadData]);

  const isSessionOpen = Boolean(currentSession && currentSession.status === 'open');

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Barra de Navegación Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <TbChevronLeft size={16} />
              <span>Volver a Configuración</span>
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Apertura y Cierre de Caja
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#3483fa] text-xs font-bold border border-blue-100">
              <TbBuilding size={14} />
              <span>{businessName}</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Control del fondo inicial de efectivo, arqueo diario y balance de cierre del negocio.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={isLoading}
          aria-label="Refrescar estado de caja"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 shadow-2xs transition-colors cursor-pointer self-start sm:self-center"
        >
          <TbRefresh size={15} className={isLoading ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tarjeta Principal de Estado de Caja */}
      <div className={`p-6 rounded-2xl border transition-all duration-200 ${
        isSessionOpen
          ? 'bg-linear-to-r from-emerald-500/5 via-white to-white border-emerald-200 shadow-xs'
          : 'bg-linear-to-r from-amber-500/5 via-white to-white border-amber-200 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Lado izquierdo: Estado y Métricas */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                isSessionOpen ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {isSessionOpen ? <TbCash size={24} /> : <TbLockCheck size={24} />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isSessionOpen 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      isSessionOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`} />
                    {isSessionOpen ? 'CAJA ABIERTA' : 'CAJA CERRADA'}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs font-semibold text-gray-600">{businessName}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                  {isSessionOpen
                    ? 'Turno operativo en curso'
                    : 'La caja está actualmente cerrada'}
                </h2>
              </div>
            </div>

            {/* Datos de la sesión actual */}
            {isSessionOpen && currentSession ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-white p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Monto Base Inicial</span>
                  <span className="text-base font-black text-gray-900 mt-0.5 block">
                    S/ {Number(currentSession.initialAmount).toFixed(2)}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Hora de Apertura</span>
                  <span className="text-xs font-bold text-gray-800 mt-1 block flex items-center gap-1">
                    <TbClock size={13} className="text-gray-400" />
                    {formatDate(currentSession.openedAt)}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Abierto por</span>
                  <span className="text-xs font-bold text-gray-800 mt-1 block truncate flex items-center gap-1">
                    <TbUser size={13} className="text-gray-400" />
                    {currentSession.openedBy?.firstName 
                      ? `${currentSession.openedBy.firstName} ${currentSession.openedBy.lastName || ''}`.trim()
                      : currentSession.openedBy?.email || 'Usuario'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-600 max-w-xl">
                Para comenzar a registrar ventas en el punto de venta, debes abrir la caja ingresando el monto en efectivo con el que se inicia el turno.
              </p>
            )}
          </div>

          {/* Lado derecho: Botón de Acción Principal */}
          <div className="shrink-0 flex items-center">
            {isSessionOpen && currentSession ? (
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <TbLockCheck size={18} />
                <span>Cerrar Caja / Realizar Arqueo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOpenModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00a650] hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <TbCash size={18} />
                <span>Abrir Caja del Negocio</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Historial de Sesiones Anteriores */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <TbHistory size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Historial de Turnos y Arqueos</h3>
              <p className="text-[11px] text-gray-400">Registros de aperturas y cierres de la empresa</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
            {history.length} {history.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <TbCash size={22} />
            </div>
            <p className="text-xs font-semibold text-gray-700">No hay sesiones de caja registradas</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Las aperturas y cierres que realices aparecerán listadas aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Apertura</th>
                  <th className="py-3 px-4">Cierre</th>
                  <th className="py-3 px-4">Monto Base</th>
                  <th className="py-3 px-4">Físico Contado</th>
                  <th className="py-3 px-4">Diferencia</th>
                  <th className="py-3 px-4">Responsable</th>
                  <th className="py-3 px-4">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {history.map((s) => {
                  const isOpen = s.status === 'open';
                  const diff = s.difference;

                  return (
                    <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Estado */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          isOpen 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                          {isOpen ? 'Abierta' : 'Cerrada'}
                        </span>
                      </td>

                      {/* Apertura */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-gray-900">
                        {formatDate(s.openedAt)}
                      </td>

                      {/* Cierre */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-600">
                        {formatDate(s.closedAt)}
                      </td>

                      {/* Monto Inicial */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-gray-800">
                        S/ {Number(s.initialAmount).toFixed(2)}
                      </td>

                      {/* Efectivo Contado */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-gray-800">
                        {s.actualAmount !== null && s.actualAmount !== undefined
                          ? `S/ ${Number(s.actualAmount).toFixed(2)}`
                          : '—'}
                      </td>

                      {/* Diferencia */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold">
                        {diff === null || diff === undefined ? (
                          <span className="text-gray-400 font-normal">—</span>
                        ) : diff === 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px]">
                            <TbCheck size={13} />
                            <span>Cuadrada (S/ 0.00)</span>
                          </span>
                        ) : diff > 0 ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 text-[11px]">
                            <TbTrendingUp size={13} />
                            <span>+S/ {diff.toFixed(2)}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 text-[11px]">
                            <TbTrendingDown size={13} />
                            <span>S/ {diff.toFixed(2)}</span>
                          </span>
                        )}
                      </td>

                      {/* Responsable */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-600">
                        <div className="truncate max-w-[140px]" title={s.openedBy?.email}>
                          {s.openedBy?.firstName 
                            ? `${s.openedBy.firstName} ${s.openedBy.lastName || ''}`.trim()
                            : s.openedBy?.email || 'Usuario'}
                        </div>
                      </td>

                      {/* Observaciones */}
                      <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate" title={s.notes || ''}>
                        {s.notes || <span className="text-gray-300 font-normal">Sin notas</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      <OpenCashModal
        isOpen={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        onSuccess={loadData}
      />

      {currentSession && (
        <CloseCashModal
          session={currentSession}
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

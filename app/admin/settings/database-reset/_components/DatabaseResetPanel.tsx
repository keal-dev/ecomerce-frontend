'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  TbAlertTriangle,
  TbCheck,
  TbDatabase,
  TbLoader2,
  TbLock,
  TbRefresh,
  TbShieldCheck,
  TbTrash,
  TbX,
} from 'react-icons/tb';
import { useAuthStore } from '@/stores/auth.store';
import { useCompanyStore } from '@/stores/company.store';
import { getDatabaseStats, resetDatabase } from '@/services/system.service';
import { DatabaseStats, ResetDatabaseResponse } from '@/types/system.types';

const REQUIRED_PHRASE = 'RESETEAR BASE DE DATOS';

interface StatRowItem {
  key: keyof DatabaseStats['counts'];
  label: string;
  conditionalOnCompany?: boolean;
}

const DELETABLE_ITEMS: StatRowItem[] = [
  { key: 'products', label: 'Productos' },
  { key: 'categories', label: 'Categorías' },
  { key: 'brands', label: 'Marcas' },
  { key: 'banners', label: 'Banners y Anuncios' },
  { key: 'orders', label: 'Pedidos y Ventas' },
  { key: 'purchases', label: 'Compras a Proveedores' },
  { key: 'suppliers', label: 'Proveedores' },
  { key: 'cashSessions', label: 'Sesiones de Caja' },
  { key: 'claims', label: 'Libro de Reclamaciones' },
  { key: 'otherUsers', label: 'Otros Usuarios' },
  { key: 'company', label: 'Datos de Empresa', conditionalOnCompany: true },
];

export function DatabaseResetPanel() {
  const { currentUser, isLoading: authLoading } = useAuthStore();
  const { fetchCompany } = useCompanyStore();

  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [resetCompany, setResetCompany] = useState(true);
  const [confirmationText, setConfirmationText] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<ResetDatabaseResponse | null>(null);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isPhraseValid = confirmationText.trim().toUpperCase() === REQUIRED_PHRASE;

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const data = await getDatabaseStats();
      setStats(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'No se pudieron cargar las estadísticas de la base de datos.';
      setStatsError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      loadStats();
    } else if (!authLoading) {
      setLoadingStats(false);
    }
  }, [isSuperAdmin, authLoading, loadStats]);

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhraseValid || isResetting) return;
    setResetError(null);
    setShowConfirmModal(true);
  };

  const handleExecuteReset = async () => {
    if (!isPhraseValid || isResetting) return;
    setIsResetting(true);
    setResetError(null);

    try {
      const result = await resetDatabase({
        confirmationText: confirmationText.trim(),
        resetCompany,
      });
      setResetResult(result);
      setConfirmationText('');
      setShowConfirmModal(false);
      await Promise.all([loadStats(), fetchCompany(true)]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Ocurrió un error al intentar resetear la base de datos.';
      setResetError(Array.isArray(msg) ? msg.join(', ') : msg);
      setShowConfirmModal(false);
    } finally {
      setIsResetting(false);
    }
  };

  if (!authLoading && !isSuperAdmin) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6 sm:p-8 text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-50 text-[#de2a2a] flex items-center justify-center mx-auto mb-3">
          <TbLock size={24} />
        </div>
        <h2 className="text-lg font-black text-gray-900">Acceso Restringido</h2>
        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
          Solo el usuario con rol <span className="font-bold text-gray-800">SUPER_ADMIN</span> puede visualizar o ejecutar el reseteo de la base de datos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Cabecera de advertencia crítica */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-red-50 text-[#de2a2a] border border-red-100 flex items-center justify-center shrink-0">
            <TbDatabase size={22} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-black text-white text-[10px] font-bold tracking-wide uppercase mb-1.5">
              <TbAlertTriangle size={12} className="text-[#de2a2a]" />
              <span>Zona Crítica · Solo Super Admin</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Eliminar y Resetear Base de Datos
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Esta acción vacía de forma irreversible los registros operativos de la tienda y del panel,
              dejando el sistema limpio desde cero pero conservando intacto al usuario{' '}
              <span className="font-bold text-gray-800">SUPER_ADMIN</span>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadStats}
          disabled={loadingStats || isResetting}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-black hover:text-black text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <TbRefresh size={15} className={loadingStats ? 'animate-spin' : ''} />
          <span>Actualizar conteo</span>
        </button>
      </div>

      {/* Banner de resultado exitoso */}
      {resetResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <TbCheck size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-emerald-950">
              {resetResult.message}
            </h3>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              Se conservaron el usuario Super Admin ({resetResult.preservedSuperAdminEmail}) y el catálogo de Ubigeos ({resetResult.deletedCounts.ubigeos} registros).{' '}
              {resetResult.resetCompany
                ? 'La configuración de la empresa fue reiniciada a sus valores iniciales.'
                : 'Se mantuvieron los datos actuales de la empresa.'}
            </p>
            <div className="flex flex-wrap gap-2 mt-2.5 text-[11px] font-semibold text-emerald-900">
              <span className="px-2 py-0.5 bg-white/80 rounded border border-emerald-200">
                Productos eliminados: {resetResult.deletedCounts.products}
              </span>
              <span className="px-2 py-0.5 bg-white/80 rounded border border-emerald-200">
                Pedidos eliminados: {resetResult.deletedCounts.orders}
              </span>
              <span className="px-2 py-0.5 bg-white/80 rounded border border-emerald-200">
                Compras eliminadas: {resetResult.deletedCounts.purchases}
              </span>
              <span className="px-2 py-0.5 bg-white/80 rounded border border-emerald-200">
                Otros usuarios eliminados: {resetResult.deletedCounts.otherUsers}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error al cargar estadísticas o al ejecutar reset */}
      {(statsError || resetError) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-[#de2a2a]">
          <TbAlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="text-xs font-semibold leading-relaxed">
            {resetError || statsError}
          </div>
        </div>
      )}

      {/* Desglose en 2 columnas: Lo que se elimina vs Lo que se conserva */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Columna 1: Se eliminará */}
        <div className="bg-white rounded-xl border border-red-200/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-[#de2a2a] flex items-center justify-center">
                  <TbTrash size={15} />
                </span>
                <div>
                  <h2 className="text-sm font-black text-gray-900">Se eliminará permanentemente</h2>
                  <p className="text-[11px] text-gray-500">
                    Tablas operativas y contadores de secuencia
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#de2a2a]">
                Irreversible
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
              {DELETABLE_ITEMS.map((item) => {
                const isCompanySkipped = item.conditionalOnCompany && !resetCompany;
                const rawCount = stats?.counts[item.key] ?? 0;
                return (
                  <div
                    key={item.key}
                    className={`rounded-lg border p-2.5 transition-colors ${
                      isCompanySkipped
                        ? 'border-gray-200 bg-gray-50 opacity-55'
                        : 'border-red-100 bg-red-50/35'
                    }`}
                  >
                    <div className="text-[10.5px] font-semibold text-gray-600 truncate">
                      {item.label}
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span
                        className={`text-base font-black ${
                          isCompanySkipped ? 'text-gray-400 line-through' : 'text-gray-900'
                        }`}
                      >
                        {loadingStats ? '—' : rawCount}
                      </span>
                      <span className="text-[9.5px] font-bold uppercase text-gray-400">
                        {isCompanySkipped ? 'Conservado' : 'registros'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna 2: Se conservará */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#2e9e7b] flex items-center justify-center">
                  <TbShieldCheck size={16} />
                </span>
                <div>
                  <h2 className="text-sm font-black text-gray-900">Se conservará intacto</h2>
                  <p className="text-[11px] text-gray-500">
                    Accesos maestros y catálogos base del sistema
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Protegido
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-gray-900">
                    Usuario SUPER_ADMIN Inicial
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black text-white">
                    SUPER_ADMIN
                  </span>
                </div>
                <p className="text-xs text-gray-700 font-mono mt-1 break-all">
                  {stats?.protectedSuperAdminEmail || currentUser?.email || 'delacruzlopezkeal@gmail.com'}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Mantendrás tu acceso completo al panel administrador y tu vínculo con Clerk.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-gray-900">
                    Catálogo Oficial de Ubigeos (INEI Perú)
                  </span>
                  <span className="text-xs font-black text-gray-800">
                    {loadingStats ? '—' : stats?.counts.ubigeos ?? 0} distritos
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Necesario para departamentos, provincias y distritos de envío en el checkout.
                </p>
              </div>

              {!resetCompany && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-amber-950">
                      Datos de la Empresa
                    </span>
                    <span className="text-[10px] font-bold text-amber-800">
                      Conservado por selección
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900 mt-1">
                    Se mantendrán el nombre, RUC, logo, redes y series SUNAT configuradas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de ejecución con doble confirmación */}
      <form
        onSubmit={handleOpenConfirmModal}
        className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5"
      >
        <div>
          <h2 className="text-sm font-black text-gray-900">
            Confirmación de Seguridad
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Configura el alcance y escribe exactamente la frase de confirmación para habilitar el botón.
          </p>
        </div>

        <label className="flex items-start gap-3 p-3.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-gray-50/70 cursor-pointer">
          <input
            type="checkbox"
            checked={resetCompany}
            onChange={(e) => setResetCompany(e.target.checked)}
            disabled={isResetting}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#de2a2a] focus:ring-[#de2a2a]"
          />
          <div>
            <div className="text-xs font-bold text-gray-900">
              También restablecer datos de la empresa (nombre, logo, RUC y series SUNAT)
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Si desmarcas esta opción, el reseteo limpiará productos, ventas, categorías, marcas, banners y usuarios, pero conservará la ficha actual de tu empresa.
            </div>
          </div>
        </label>

        <div className="max-w-lg space-y-2">
          <label
            htmlFor="reset-confirmation-input"
            className="block text-xs font-bold text-gray-800"
          >
            Escribe{' '}
            <span className="font-mono px-1.5 py-0.5 rounded bg-red-50 text-[#de2a2a] border border-red-200 select-all">
              {REQUIRED_PHRASE}
            </span>{' '}
            para continuar:
          </label>
          <input
            id="reset-confirmation-input"
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={REQUIRED_PHRASE}
            disabled={isResetting}
            autoComplete="off"
            spellCheck={false}
            className="w-full px-3.5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#de2a2a] focus:ring-2 focus:ring-[#de2a2a]/20"
          />
        </div>

        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[11px] text-gray-500">
            Se abrirá un último diálogo de confirmación antes de ejecutar la transacción en PostgreSQL.
          </p>
          <button
            type="submit"
            disabled={!isPhraseValid || isResetting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#de2a2a] hover:bg-[#b91c1c] text-white text-xs font-black tracking-wide transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <TbTrash size={16} />
            <span>Eliminar y Resetear Base de Datos</span>
          </button>
        </div>
      </form>

      {/* Modal de confirmación final */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-gray-200 max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-[#de2a2a] flex items-center justify-center shrink-0">
                  <TbAlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    ¿Confirmas el reseteo total?
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Esta operación no se puede deshacer.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isResetting && setShowConfirmModal(false)}
                disabled={isResetting}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
                aria-label="Cerrar diálogo"
              >
                <TbX size={18} />
              </button>
            </div>

            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3.5 text-xs text-gray-700 space-y-1.5 leading-relaxed">
              <p>
                Se eliminarán todos los productos, categorías, marcas, banners, pedidos, compras,
                proveedores, cajas, reclamos y otros usuarios.
              </p>
              <p>
                {resetCompany
                  ? 'También se reiniciarán los datos de la empresa.'
                  : 'Se conservarán los datos actuales de la empresa.'}
              </p>
              <p className="font-bold text-gray-900">
                Se conservará el usuario SUPER_ADMIN ({stats?.protectedSuperAdminEmail || 'delacruzlopezkeal@gmail.com'}) y los Ubigeos.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isResetting}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={isResetting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#de2a2a] hover:bg-[#b91c1c] text-white text-xs font-black cursor-pointer disabled:opacity-60"
              >
                {isResetting ? (
                  <>
                    <TbLoader2 size={15} className="animate-spin" />
                    <span>Reseteando...</span>
                  </>
                ) : (
                  <>
                    <TbTrash size={15} />
                    <span>Sí, Resetear Ahora</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

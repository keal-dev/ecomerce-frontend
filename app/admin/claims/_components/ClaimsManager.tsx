'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  TbBook,
  TbSearch,
  TbRefresh,
  TbClock,
  TbEye,
  TbCheck,
  TbAlertCircle,
  TbX,
  TbSend,
  TbUser,
  TbMapPin,
  TbShoppingBag,
  TbFileText,
} from 'react-icons/tb';
import { getClaims, respondClaim } from '@/services/claim.service';
import { Claim, ClaimStatus } from '@/types/claim.types';

const STATUS_CONFIG: Record<
  ClaimStatus,
  { label: string; badgeClass: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Pendiente',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: TbClock,
  },
  in_review: {
    label: 'En Revisión',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: TbEye,
  },
  resolved: {
    label: 'Resuelto',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: TbCheck,
  },
};

export function ClaimsManager() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClaimStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'reclamo' | 'queja'>('ALL');

  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [responseStatus, setResponseStatus] = useState<ClaimStatus>('resolved');
  const [responseText, setResponseText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  const loadClaims = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getClaims();
      setClaims(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'No se pudieron cargar las hojas de reclamación.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const kpis = useMemo(() => {
    const total = claims.length;
    const pending = claims.filter((c) => c.status === 'pending').length;
    const inReview = claims.filter((c) => c.status === 'in_review').length;
    const resolved = claims.filter((c) => c.status === 'resolved').length;
    return { total, pending, inReview, resolved };
  }, [claims]);

  const filteredClaims = useMemo(() => {
    const term = search.trim().toLowerCase();
    return claims.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && c.claimType !== typeFilter) return false;
      if (!term) return true;
      return (
        c.code.toLowerCase().includes(term) ||
        c.fullName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.docNumber.toLowerCase().includes(term) ||
        (c.orderNumber || '').toLowerCase().includes(term)
      );
    });
  }, [claims, search, statusFilter, typeFilter]);

  const openModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setResponseStatus(claim.status === 'pending' ? 'resolved' : claim.status);
    setResponseText(claim.adminResponse || '');
    setModalError(null);
    setModalSuccess(null);
  };

  const handleSaveResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    if (!responseText.trim()) {
      setModalError('Debes redactar una respuesta oficial para el consumidor.');
      return;
    }

    setIsSaving(true);
    setModalError(null);
    setModalSuccess(null);

    try {
      const updated = await respondClaim(selectedClaim.id, {
        status: responseStatus,
        adminResponse: responseText.trim(),
      });
      setClaims((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelectedClaim(updated);
      setModalSuccess(
        `Respuesta registrada y notificación enviada a ${updated.email}.`,
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setModalError(
        Array.isArray(msg)
          ? msg.join(' ')
          : msg || 'Error al guardar la respuesta.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-[#3483fa] text-[11px] font-bold mb-1.5">
            <TbBook size={14} />
            <span>LIBRO DE RECLAMACIONES INDECOPI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Gestión de Reclamos y Quejas
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Revisa las hojas de reclamación enviadas desde la tienda y emite respuestas formales por correo.
          </p>
        </div>

        <button
          type="button"
          onClick={loadClaims}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-2xs transition-colors cursor-pointer self-start"
        >
          <TbRefresh size={15} className={isLoading ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-gray-400">Total Hojas</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{kpis.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200/80 p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-amber-600">Pendientes</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{kpis.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-200/80 p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-blue-600">En Revisión</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{kpis.inReview}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200/80 p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-emerald-600">Resueltos</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{kpis.resolved}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <TbSearch
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código (LR-...), nombre, correo, DNI o pedido..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ClaimStatus)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:border-[#3483fa]"
        >
          <option value="ALL">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="in_review">En Revisión</option>
          <option value="resolved">Resuelto</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as 'ALL' | 'reclamo' | 'queja')
          }
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:border-[#3483fa]"
        >
          <option value="ALL">Reclamos y Quejas</option>
          <option value="reclamo">Solo Reclamos</option>
          <option value="queja">Solo Quejas</option>
        </select>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <TbAlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            Cargando hojas de reclamación...
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 space-y-2">
            <TbBook size={32} className="mx-auto text-gray-300" />
            <p className="font-semibold text-gray-700">
              No se encontraron reclamos ni quejas con los filtros actuales.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold uppercase text-gray-500">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Consumidor</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredClaims.map((claim) => {
                  const cfg = STATUS_CONFIG[claim.status] || STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  const formattedDate = new Date(claim.createdAt).toLocaleDateString(
                    'es-PE',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    },
                  );

                  return (
                    <tr key={claim.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {claim.code}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">{claim.fullName}</p>
                        <p className="text-[11px] text-gray-500">
                          {claim.docType} {claim.docNumber} • {claim.email}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                            claim.claimType === 'queja'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {claim.claimType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${cfg.badgeClass}`}
                        >
                          <StatusIcon size={13} />
                          <span>{cfg.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openModal(claim)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <TbEye size={14} />
                          <span>Ver / Responder</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalle y Respuesta */}
      {selectedClaim && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3483fa]">
                  Hoja de Reclamación INDECOPI
                </span>
                <h2 className="text-base font-black text-gray-900">
                  {selectedClaim.code} —{' '}
                  {selectedClaim.claimType === 'queja' ? 'Queja' : 'Reclamo'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <TbX size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="space-y-1">
                  <p className="font-bold text-gray-700 flex items-center gap-1.5">
                    <TbUser size={14} className="text-[#3483fa]" />
                    <span>Consumidor</span>
                  </p>
                  <p className="text-gray-900 font-semibold">{selectedClaim.fullName}</p>
                  <p className="text-gray-600">
                    {selectedClaim.docType}: {selectedClaim.docNumber}
                  </p>
                  <p className="text-gray-600">{selectedClaim.email}</p>
                  {selectedClaim.phone && (
                    <p className="text-gray-600">Tel: {selectedClaim.phone}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-gray-700 flex items-center gap-1.5">
                    <TbMapPin size={14} className="text-[#3483fa]" />
                    <span>Domicilio</span>
                  </p>
                  <p className="text-gray-700">{selectedClaim.address}</p>
                  <p className="text-gray-600">
                    {selectedClaim.district}, {selectedClaim.province},{' '}
                    {selectedClaim.department}
                  </p>
                  {selectedClaim.isMinor && (
                    <p className="text-amber-800 bg-amber-50 p-1.5 rounded mt-1">
                      <strong>Tutor:</strong> {selectedClaim.tutorName} (
                      {selectedClaim.tutorDocType} {selectedClaim.tutorDocNumber})
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1.5">
                <p className="font-bold text-gray-700 flex items-center gap-1.5">
                  <TbShoppingBag size={14} className="text-[#3483fa]" />
                  <span>Bien Contratado</span>
                </p>
                <p>
                  <strong>Tipo:</strong>{' '}
                  {selectedClaim.contractType === 'servicio' ? 'Servicio' : 'Producto'}{' '}
                  • <strong>Monto:</strong>{' '}
                  {selectedClaim.claimedAmount !== null
                    ? `S/ ${Number(selectedClaim.claimedAmount).toFixed(2)}`
                    : 'No consignado'}
                  {selectedClaim.orderNumber && (
                    <>
                      {' '}
                      • <strong>Pedido:</strong> {selectedClaim.orderNumber}
                    </>
                  )}
                </p>
                <p className="text-gray-700">{selectedClaim.contractDescription}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                <p className="font-bold text-gray-700 flex items-center gap-1.5">
                  <TbFileText size={14} className="text-[#3483fa]" />
                  <span>Detalle y Pedido del Consumidor</span>
                </p>
                <div>
                  <span className="font-semibold text-gray-600">Hechos:</span>
                  <p className="text-gray-800 mt-0.5 whitespace-pre-line">
                    {selectedClaim.claimDetail}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Pedido:</span>
                  <p className="text-gray-800 mt-0.5 whitespace-pre-line">
                    {selectedClaim.claimRequest}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveResponse} className="space-y-3 pt-2 border-t border-gray-100">
                {modalError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                    <TbAlertCircle size={16} />
                    <span>{modalError}</span>
                  </div>
                )}
                {modalSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
                    <TbCheck size={16} />
                    <span>{modalSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={responseStatus}
                      onChange={(e) =>
                        setResponseStatus(e.target.value as ClaimStatus)
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_review">En Revisión</option>
                      <option value="resolved">Resuelto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Respuesta Oficial al Consumidor (se enviará por correo)
                  </label>
                  <textarea
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Redacta la respuesta formal o las acciones tomadas respecto a este reclamo..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClaim(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#3483fa] hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl font-bold cursor-pointer"
                  >
                    <TbSend size={15} />
                    <span>{isSaving ? 'Enviando...' : 'Guardar y Enviar Respuesta'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

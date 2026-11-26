'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TbReceipt,
  TbFileInvoice,
  TbCheck,
  TbAlertCircle,
  TbDeviceFloppy,
  TbExternalLink,
  TbShieldCheck,
} from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';
import { getOrders } from '@/services/order.service';
import { Order } from '@/types/order.types';

export function BillingSettingsForm() {
  const { company, fetchCompany, updateCompanyData, isSaving } = useCompanyStore();

  const [boletaSeries, setBoletaSeries] = useState('B001');
  const [facturaSeries, setFacturaSeries] = useState('F001');
  const [orders, setOrders] = useState<Order[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCompany();
    getOrders()
      .then((data) => setOrders(data))
      .catch(() => setOrders([]));
  }, [fetchCompany]);

  useEffect(() => {
    if (company) {
      setBoletaSeries(company.boletaSeries || 'B001');
      setFacturaSeries(company.facturaSeries || 'F001');
    }
  }, [company]);

  // Calcular último correlativo emitido para la serie de Boleta ingresada
  const boletaStats = useMemo(() => {
    const cleanSerie = boletaSeries.trim().toUpperCase();
    const matching = orders.filter(
      (o) => (o.invoiceSeries || '').toUpperCase() === cleanSerie && o.invoiceNumber,
    );
    let maxNum = 0;
    matching.forEach((o) => {
      const n = parseInt((o.invoiceNumber || '').replace(/\D/g, ''), 10);
      if (!isNaN(n) && n > maxNum) maxNum = n;
    });
    return {
      totalEmitted: matching.length,
      lastNumber: maxNum,
      nextNumber: maxNum > 0 ? maxNum + 1 : cleanSerie === 'B001' ? 2 : 1,
    };
  }, [orders, boletaSeries]);

  // Calcular último correlativo emitido para la serie de Factura ingresada
  const facturaStats = useMemo(() => {
    const cleanSerie = facturaSeries.trim().toUpperCase();
    const matching = orders.filter(
      (o) => (o.invoiceSeries || '').toUpperCase() === cleanSerie && o.invoiceNumber,
    );
    let maxNum = 0;
    matching.forEach((o) => {
      const n = parseInt((o.invoiceNumber || '').replace(/\D/g, ''), 10);
      if (!isNaN(n) && n > maxNum) maxNum = n;
    });
    return {
      totalEmitted: matching.length,
      lastNumber: maxNum,
      nextNumber: maxNum + 1,
    };
  }, [orders, facturaSeries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanBoleta = boletaSeries.trim().toUpperCase();
    const cleanFactura = facturaSeries.trim().toUpperCase();

    if (!/^B[A-Z0-9]{3}$/.test(cleanBoleta)) {
      setErrorMsg(
        'La serie de Boleta Electrónica debe empezar con "B" y tener 4 caracteres (ejemplo: B001, B002).',
      );
      return;
    }

    if (!/^F[A-Z0-9]{3}$/.test(cleanFactura)) {
      setErrorMsg(
        'La serie de Factura Electrónica debe empezar con "F" y tener 4 caracteres (ejemplo: F001, F002).',
      );
      return;
    }

    try {
      await updateCompanyData({
        boletaSeries: cleanBoleta,
        facturaSeries: cleanFactura,
      });
      setBoletaSeries(cleanBoleta);
      setFacturaSeries(cleanFactura);
      setSuccessMsg(
        `Series actualizadas correctamente (${cleanBoleta} y ${cleanFactura}). Todos los nuevos comprobantes de Tienda Web y POS se emitirán con estas series.`,
      );
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Ocurrió un error al guardar las series de facturación.',
      );
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold mb-1.5">
            <TbShieldCheck size={14} />
            <span>Facturación Electrónica SUNAT (Facturalo.pe)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Series de Facturación y Comprobantes
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configura las series oficiales con las que el sistema emitirá Boletas y Facturas tanto en la Tienda Online como en el Punto de Venta (POS).
          </p>
        </div>

        <Link
          href="/admin/billing"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <TbReceipt size={16} className="text-gray-500" />
          <span>Ir al Libro de Comprobantes</span>
          <TbExternalLink size={13} className="text-gray-400" />
        </Link>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-start gap-2">
          <TbAlertCircle size={17} className="text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-start gap-2">
          <TbCheck size={17} className="text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Serie de Boleta */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gray-100 text-gray-800">
                  <TbReceipt size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">
                    Boleta de Venta Electrónica
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Código SUNAT: Tipo 03 (DNI / Clientes Varios)
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 text-gray-700">
                Activa: {company?.boletaSeries || 'B001'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Serie de Boleta (4 caracteres, inicia con B)
              </label>
              <input
                type="text"
                maxLength={4}
                value={boletaSeries}
                onChange={(e) => setBoletaSeries(e.target.value.toUpperCase())}
                placeholder="B001"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-900 uppercase focus:outline-none focus:bg-white focus:border-gray-900"
              />
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-gray-400">Sugerencias rápidas:</span>
                {['B001', 'B002', 'B003'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBoletaSeries(s)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border cursor-pointer transition-colors ${
                      boletaSeries.toUpperCase() === s
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Comprobantes emitidos en {boletaSeries || 'B001'}:</span>
                <span className="font-bold text-gray-900">{boletaStats.totalEmitted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Próximo correlativo a emitir:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {boletaSeries.toUpperCase() || 'B001'}-{boletaStats.nextNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Serie de Factura */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gray-100 text-gray-800">
                  <TbFileInvoice size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">
                    Factura Electrónica
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Código SUNAT: Tipo 01 (Empresas con RUC 11 dígitos)
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 text-gray-700">
                Activa: {company?.facturaSeries || 'F001'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Serie de Factura (4 caracteres, inicia con F)
              </label>
              <input
                type="text"
                maxLength={4}
                value={facturaSeries}
                onChange={(e) => setFacturaSeries(e.target.value.toUpperCase())}
                placeholder="F001"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-900 uppercase focus:outline-none focus:bg-white focus:border-gray-900"
              />
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-gray-400">Sugerencias rápidas:</span>
                {['F001', 'F002', 'F003'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFacturaSeries(s)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border cursor-pointer transition-colors ${
                      facturaSeries.toUpperCase() === s
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Comprobantes emitidos en {facturaSeries || 'F001'}:</span>
                <span className="font-bold text-gray-900">{facturaStats.totalEmitted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Próximo correlativo a emitir:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {facturaSeries.toUpperCase() || 'F001'}-{facturaStats.nextNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de guardado */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-gray-500">
            Emisor fiscal configurado:{' '}
            <strong className="text-gray-800">
              {company?.legalName || company?.name || 'Cooperativa Gourmet'}
            </strong>{' '}
            {company?.taxId ? `(RUC: ${company.taxId})` : ''}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <TbDeviceFloppy size={17} />
            <span>{isSaving ? 'Guardando cambios...' : 'Guardar Series de Facturación'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

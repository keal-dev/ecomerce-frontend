'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TbSearch,
  TbPlus,
  TbRefresh,
  TbEye,
  TbTruckDelivery,
  TbBox,
  TbCurrencyDollar,
  TbFileInvoice,
  TbCalendar,
  TbX,
} from 'react-icons/tb';
import { usePurchaseStore } from '@/stores/purchase.store';
import { Purchase } from '@/types/purchase.types';
import { PurchaseDetailModal } from './PurchaseDetailModal';

export function PurchasesManager() {
  const { purchases, isLoading, fetchPurchases } = usePurchaseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleOpenDetail = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedPurchase(null);
  };

  // Filtrado reactivo en tiempo real
  const filteredPurchases = useMemo(() => {
    if (!searchQuery.trim()) return purchases;
    const q = searchQuery.toLowerCase().trim();
    return purchases.filter(
      (p) =>
        p.purchaseNumber.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q) ||
        (p.documentNumber && p.documentNumber.toLowerCase().includes(q)),
    );
  }, [purchases, searchQuery]);

  // Cálculos de KPIs
  const stats = useMemo(() => {
    const totalPurchases = purchases.length;
    const totalInvested = purchases.reduce(
      (acc, p) => acc + Number(p.totalAmount || 0),
      0,
    );
    const totalUnits = purchases.reduce(
      (acc, p) =>
        acc + (p.items?.reduce((sub, it) => sub + (it.quantity || 0), 0) || 0),
      0,
    );

    return {
      totalPurchases,
      totalInvested,
      totalUnits,
    };
  }, [purchases]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <TbTruckDelivery className="text-[#3483fa]" size={26} />
              <span>Compras e Inventario</span>
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#3483fa] border border-blue-200 shadow-2xs">
              {purchases.length} compras
            </span>
            {stats.totalUnits > 0 && (
              <span className="hidden sm:inline-flex text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                +{stats.totalUnits} unid.
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Historial de compras a proveedores e ingresos de stock al catálogo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchPurchases()}
            disabled={isLoading}
            className="p-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Actualizar listado"
          >
            <TbRefresh size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <Link
            href="/admin/purchases/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <TbPlus size={18} />
            <span>Nueva Compra</span>
          </Link>
        </div>
      </div>

      {/* Buscador y Resumen compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <TbSearch
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código (COM-0001), proveedor o comprobante..."
            className="w-full bg-white border border-gray-300 hover:border-gray-400 rounded-lg py-2 pl-9 pr-8 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#3483fa] focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
              title="Limpiar búsqueda"
            >
              <TbX size={14} />
            </button>
          )}
        </div>

        {stats.totalInvested > 0 && (
          <div className="text-xs text-gray-500 font-medium">
            Inversión total acumulada:{' '}
            <span className="font-bold text-gray-900">
              S/ {stats.totalInvested.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Tabla de Compras */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredPurchases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Proveedor</th>
                  <th className="px-4 py-3">Comprobante</th>
                  <th className="px-4 py-3 text-center">Ítems / Unidades</th>
                  <th className="px-4 py-3 text-right">Inversión (S/)</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-center w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPurchases.map((purchase) => {
                  const units =
                    purchase.items?.reduce((acc, it) => acc + (it.quantity || 0), 0) || 0;

                  return (
                    <tr
                      key={purchase.id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      {/* Código */}
                      <td className="px-4 py-3.5 font-bold">
                        <span className="font-mono text-xs bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-md shadow-2xs">
                          {purchase.purchaseNumber}
                        </span>
                      </td>

                      {/* Proveedor */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-gray-900">
                          {purchase.supplierName}
                        </p>
                        {purchase.notes && (
                          <p className="text-[11px] text-gray-400 truncate max-w-xs">
                            {purchase.notes}
                          </p>
                        )}
                      </td>

                      {/* Comprobante */}
                      <td className="px-4 py-3.5 text-gray-600">
                        <span className="font-semibold text-gray-800">
                          {purchase.documentType || 'Sin comprobante'}
                        </span>
                        {purchase.documentNumber && (
                          <span className="block font-mono text-[11px] text-gray-400">
                            {purchase.documentNumber}
                          </span>
                        )}
                      </td>

                      {/* Ítems / Unidades */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full shadow-2xs">
                          +{units} unid. ({purchase.items?.length || 0} prod.)
                        </span>
                      </td>

                      {/* Monto Invertido */}
                      <td className="px-4 py-3.5 text-right font-black text-gray-900 text-sm">
                        S/ {Number(purchase.totalAmount).toFixed(2)}
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs">
                          <TbCalendar size={14} className="text-gray-400" />
                          <span>
                            {new Date(purchase.createdAt).toLocaleDateString('es-PE')}
                          </span>
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(purchase)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-[#3483fa] hover:text-[#3483fa] text-gray-700 font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer"
                        >
                          <TbEye size={15} />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#3483fa] border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
              <TbTruckDelivery size={30} />
            </div>
            <h3 className="text-sm font-bold text-gray-800">
              {searchQuery ? 'No se encontraron compras' : 'Aún no has registrado compras'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Prueba ajustando el término de búsqueda.'
                : 'Registra tu primera compra a proveedores para aumentar el stock de tus productos automáticamente.'}
            </p>
            {!searchQuery && (
              <Link
                href="/admin/purchases/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <TbPlus size={16} />
                <span>Registrar Primera Compra</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Modal Detalle */}
      <PurchaseDetailModal
        purchase={selectedPurchase}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
}

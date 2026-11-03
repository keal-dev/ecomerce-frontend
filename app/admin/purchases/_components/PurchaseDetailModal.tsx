'use client';

import React from 'react';
import {
  TbX,
  TbBuildingStore,
  TbFileInvoice,
  TbCalendar,
  TbBox,
  TbCurrencyDollar,
  TbNotes,
} from 'react-icons/tb';
import { Purchase } from '@/types/purchase.types';

interface PurchaseDetailModalProps {
  purchase: Purchase | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PurchaseDetailModal({
  purchase,
  isOpen,
  onClose,
}: PurchaseDetailModalProps) {
  if (!isOpen || !purchase) return null;

  const totalItemsCount = purchase.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
              <TbFileInvoice size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">
                  Detalle de Compra: {purchase.purchaseNumber}
                </h2>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  Ingreso Exitoso
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Registrado el {new Date(purchase.createdAt).toLocaleString('es-PE')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <TbX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <TbBuildingStore size={15} className="text-blue-500" />
                <span>Proveedor</span>
              </span>
              <p className="text-sm font-bold text-slate-900 truncate">
                {purchase.supplierName}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <TbFileInvoice size={15} className="text-purple-500" />
                <span>Comprobante</span>
              </span>
              <p className="text-sm font-bold text-slate-900">
                {purchase.documentType || 'Sin comprobante'}{' '}
                {purchase.documentNumber && (
                  <span className="font-mono text-xs text-slate-600 block">
                    {purchase.documentNumber}
                  </span>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <TbCurrencyDollar size={15} className="text-emerald-600" />
                <span>Inversión Total</span>
              </span>
              <p className="text-base font-black text-emerald-950">
                S/ {Number(purchase.totalAmount).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Notes if available */}
          {purchase.notes && (
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <TbNotes size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Observaciones:</strong> {purchase.notes}
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <TbBox size={16} className="text-blue-500" />
                <span>Productos Ingresados al Inventario ({totalItemsCount} unidades)</span>
              </h3>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[540px]">
                  <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-3 py-2">Producto</th>
                      <th className="px-3 py-2 text-center w-28">Cant. Ingresada</th>
                      <th className="px-3 py-2 text-right w-28">Costo Unit. (S/)</th>
                      <th className="px-3 py-2 text-right w-28">Subtotal (S/)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {purchase.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-1.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded bg-gray-50 border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                              {item.product?.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.title}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <TbBox size={14} className="text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0 leading-tight">
                              <p className="font-bold text-gray-900 truncate max-w-sm text-xs">
                                {item.product?.title || 'Producto sin título'}
                              </p>
                              {item.product?.sku && (
                                <span className="text-[10px] font-mono text-gray-400 block">
                                  SKU: {item.product.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-black border border-blue-200 text-[11px] shadow-2xs">
                            +{item.quantity} unid.
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right font-semibold text-gray-700">
                          S/ {Number(item.costPrice).toFixed(2)}
                        </td>
                        <td className="px-3 py-1.5 text-right font-black text-gray-900">
                          S/ {Number(item.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold text-xs border-t border-gray-200">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right text-gray-700">
                        Total de la Compra:
                      </td>
                      <td className="px-3 py-2 text-right font-black text-emerald-600 text-sm">
                        S/ {Number(purchase.totalAmount).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

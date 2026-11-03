'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TbChevronLeft,
  TbSearch,
  TbPlus,
  TbTrash,
  TbCheck,
  TbLoader2,
  TbAlertCircle,
  TbTruckDelivery,
  TbBox,
  TbFileInvoice,
  TbBuildingStore,
  TbCurrencyDollar,
  TbArrowNarrowRight,
  TbX,
} from 'react-icons/tb';
import { usePurchaseStore } from '@/stores/purchase.store';
import { useProductStore } from '@/stores/product.store';
import { useSupplierStore } from '@/stores/supplier.store';
import { SupplierModal } from '@/app/admin/suppliers/_components/SupplierModal';
import { Product } from '@/types/product.types';
import { Supplier } from '@/types/supplier.types';

interface PurchaseItemRow {
  product: Product;
  quantity: number;
  costPrice: number;
  salePrice: number;
}

export function PurchaseForm() {
  const router = useRouter();
  const { addPurchase } = usePurchaseStore();
  const { products, fetchProducts } = useProductStore();
  const { suppliers, fetchSuppliers } = useSupplierStore();

  const [supplierName, setSupplierName] = useState('');
  const [documentType, setDocumentType] = useState('Factura');
  const [documentNumber, setDocumentNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);

  // Filtrado de proveedores para el autocompletado
  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch.trim()) return suppliers.slice(0, 8);
    const q = supplierSearch.toLowerCase().trim();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.documentNumber && s.documentNumber.toLowerCase().includes(q)) ||
        (s.contactName && s.contactName.toLowerCase().includes(q)),
    );
  }, [suppliers, supplierSearch]);

  const handleSelectSupplier = (s: Supplier) => {
    setSelectedSupplier(s);
    setSupplierName(s.name);
    if (s.documentNumber) setDocumentNumber(s.documentNumber);
    if (s.documentType) {
      setDocumentType(s.documentType === 'RUC' ? 'Factura' : 'Boleta');
    }
    setSupplierSearch('');
    setIsSupplierDropdownOpen(false);
  };

  const handleClearSelectedSupplier = () => {
    setSelectedSupplier(null);
    setSupplierName('');
    setDocumentNumber('');
    setSupplierSearch('');
  };

  const [items, setItems] = useState<PurchaseItemRow[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers(undefined, true);
  }, [fetchProducts, fetchSuppliers]);

  // Filtrado de productos para el buscador
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 8);
    const q = productSearch.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)),
    );
  }, [products, productSearch]);

  const handleAddProduct = (product: Product) => {
    const existingIndex = items.findIndex((i) => i.product.id === product.id);
    if (existingIndex >= 0) {
      // Incrementar cantidad
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === existingIndex
            ? { ...it, quantity: it.quantity + 1 }
            : it,
        ),
      );
    } else {
      const currentPrice = Number(product.price || 0);
      // Traer el costo directamente de la base de datos (columna products.cost_price)
      const dbCost =
        product.costPrice !== undefined && product.costPrice !== null
          ? Number(product.costPrice)
          : 0;

      setItems((prev) => [
        ...prev,
        {
          product,
          quantity: 1,
          costPrice: dbCost,
          salePrice: currentPrice,
        },
      ]);
    }
    setProductSearch('');
    setIsSearchOpen(false);
    setError(null);
  };

  const handleUpdateQuantity = (index: number, val: number) => {
    const qty = Math.max(1, isNaN(val) ? 1 : val);
    setItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, quantity: qty } : it)),
    );
  };

  const handleUpdateCost = (index: number, val: number) => {
    const cost = Math.max(0, isNaN(val) ? 0 : val);
    setItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, costPrice: cost } : it)),
    );
  };

  const handleUpdateSalePrice = (index: number, val: number) => {
    const price = Math.max(0, isNaN(val) ? 0 : val);
    setItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, salePrice: price } : it)),
    );
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Cálculos totales
  const totalUnits = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.quantity || 0), 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce(
      (acc, it) => acc + (it.quantity || 0) * (it.costPrice || 0),
      0,
    );
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!supplierName.trim()) {
      setError('Por favor indica el nombre o razón social del proveedor.');
      return;
    }

    if (items.length === 0) {
      setError('Debes agregar al menos un producto a la compra.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addPurchase({
        supplierName: supplierName.trim(),
        documentType: documentType || undefined,
        documentNumber: documentNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        items: items.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
          costPrice: it.costPrice,
          newSalePrice: it.salePrice,
        })),
      });

      router.push('/admin/purchases');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Error al registrar la compra';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-7xl mx-auto pb-16">
      {/* Barra Superior Compacta */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-3">
        <div>
          <Link
            href="/admin/purchases"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-1"
          >
            <TbChevronLeft size={15} />
            <span>Volver al historial de compras</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <TbTruckDelivery className="text-[#3483fa]" size={24} />
              <span>Registrar Compra / Ingreso de Stock</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/admin/purchases"
            className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <TbLoader2 size={15} className="animate-spin" />
                <span>Registrando...</span>
              </>
            ) : (
              <>
                <TbCheck size={16} />
                <span>Guardar e Ingresar Stock</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
          <TbAlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Principal: 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Columna Izquierda (2/3): Buscador y Tabla de Productos Compacta */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card: Selector de Productos */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
                <TbBox size={17} className="text-[#3483fa]" />
                <span>Productos a Ingresar al Inventario</span>
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#3483fa] border border-blue-100">
                {items.length} {items.length === 1 ? 'ítem' : 'ítems'} en la compra
              </span>
            </div>

            {/* Buscador de productos con autocompletado compacto */}
            <div className="relative">
              <div className="relative shadow-2xs rounded-lg">
                <TbSearch
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={productSearch}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  placeholder="Buscar producto por título o código SKU para agregar..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white focus:border-[#3483fa] rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium placeholder:text-slate-400"
                />
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => setProductSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <TbX size={14} />
                  </button>
                )}
              </div>

              {/* Dropdown de Resultados Compacto con fondo slate suave */}
              {isSearchOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsSearchOpen(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-100 border border-slate-300 rounded-xl shadow-xl z-30 max-h-64 overflow-y-auto divide-y divide-slate-200">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((p) => {
                        const isAlreadyAdded = items.some(
                          (it) => it.product.id === p.id,
                        );
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleAddProduct(p)}
                            className="py-2.5 px-3.5 hover:bg-slate-200/80 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded bg-white border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                                {p.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={p.imageUrl}
                                    alt={p.title}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <TbBox size={14} className="text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0 leading-tight">
                                <p className="font-bold text-slate-900 group-hover:text-blue-600 truncate max-w-[240px] sm:max-w-md">
                                  {p.title}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {p.sku ? `SKU: ${p.sku}` : 'Sin SKU'} • Stock:{' '}
                                  <strong className="text-slate-700">
                                    {p.stock} unid.
                                  </strong>
                                  {p.costPrice && Number(p.costPrice) > 0 && (
                                    <span className="text-emerald-700 ml-1.5 font-medium">
                                      • Costo anterior: S/ {Number(p.costPrice).toFixed(2)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-bold text-slate-900">
                                S/ {Number(p.price).toFixed(2)}
                              </span>
                              <span
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all shadow-2xs ${
                                  isAlreadyAdded
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-white text-blue-600 group-hover:bg-blue-600 group-hover:text-white border border-slate-200'
                                }`}
                              >
                                {isAlreadyAdded ? '+1 sumar' : '+ Agregar'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-500 bg-slate-100">
                        No se encontraron productos coincidentes.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Tabla de Productos Seleccionados Ultra Compacta */}
            {items.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[660px]">
                    <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-3 py-2">Producto</th>
                        <th className="px-2 py-2 text-center w-20">Cant.</th>
                        <th className="px-2 py-2 text-center w-28">Stock</th>
                        <th className="px-2.5 py-2 text-right w-24">Costo (S/)</th>
                        <th className="px-2 py-2 text-center w-36">PVP Tienda / Margen</th>
                        <th className="px-3 py-2 text-right w-24">Subtotal</th>
                        <th className="px-2 py-2 text-center w-8"></th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {items.map((row, idx) => {
                      const currentStock = Number(row.product.stock || 0);
                      const newStock = currentStock + Number(row.quantity || 0);
                      const subtotal = (row.quantity || 0) * (row.costPrice || 0);
                      const originalPrice = Number(row.product.price || 0);
                      const isPriceChanged = Math.abs(row.salePrice - originalPrice) > 0.001;
                      const profit = row.salePrice - row.costPrice;
                      const marginPercent = row.salePrice > 0 ? (profit / row.salePrice) * 100 : 0;

                      return (
                        <tr key={row.product.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Producto con Miniatura Compacta 28x28 */}
                          <td className="px-3 py-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded bg-gray-50 border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                                {row.product.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={row.product.imageUrl}
                                    alt={row.product.title}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <TbBox size={14} className="text-gray-400" />
                                )}
                              </div>
                              <div className="min-w-0 leading-tight">
                                <p className="font-bold text-gray-900 truncate max-w-[140px] sm:max-w-xs text-xs">
                                  {row.product.title}
                                </p>
                                {row.product.sku && (
                                  <span className="text-[10px] font-mono text-gray-400 block">
                                    {row.product.sku}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Cantidad Input Compacto */}
                          <td className="px-2 py-1.5 text-center">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={row.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(idx, parseInt(e.target.value, 10))
                              }
                              className="w-14 h-7 px-1 border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded text-center font-bold text-gray-900 text-xs focus:outline-none shadow-2xs"
                            />
                          </td>

                          {/* Impacto en Stock Compacto */}
                          <td className="px-2 py-1.5 text-center">
                            <div className="inline-flex items-center gap-1 text-[11px]">
                              <span className="text-gray-400 font-medium">
                                {currentStock}
                              </span>
                              <TbArrowNarrowRight size={12} className="text-emerald-500 shrink-0" />
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 font-bold text-emerald-700 text-[11px] shadow-2xs">
                                {newStock} unid.
                              </span>
                            </div>
                          </td>

                          {/* Costo Unitario Input Compacto */}
                          <td className="px-2.5 py-1.5 text-right">
                            <div className="relative inline-block w-22">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">
                                S/
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={row.costPrice}
                                onChange={(e) =>
                                  handleUpdateCost(idx, parseFloat(e.target.value))
                                }
                                className="w-full pl-5 pr-1.5 py-0 h-7 border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded text-right font-bold text-gray-900 text-xs focus:outline-none shadow-2xs"
                              />
                            </div>
                          </td>

                          {/* PVP Tienda y Margen en Vivo */}
                          <td className="px-2 py-1.5 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="relative inline-block w-22">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">
                                  S/
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={row.salePrice}
                                  onChange={(e) =>
                                    handleUpdateSalePrice(idx, parseFloat(e.target.value))
                                  }
                                  title="Precio de venta en la tienda web"
                                  className={`w-full pl-5 pr-1.5 py-0 h-7 border rounded text-right font-bold text-xs focus:outline-none shadow-2xs transition-all ${
                                    isPriceChanged
                                      ? 'border-[#3483fa] bg-blue-50/50 text-[#3483fa] ring-1 ring-[#3483fa]'
                                      : 'border-gray-300 hover:border-gray-400 text-gray-900'
                                  }`}
                                />
                              </div>

                              {profit < 0 ? (
                                <span
                                  className="inline-flex items-center px-1.5 py-0 rounded bg-rose-50 border border-rose-200 text-rose-700 font-black text-[9px] shadow-2xs whitespace-nowrap"
                                  title="El costo de compra supera el precio de venta"
                                >
                                  🚨 Pérdida (-S/ {Math.abs(profit).toFixed(2)})
                                </span>
                              ) : marginPercent < 15 ? (
                                <span
                                  className="inline-flex items-center px-1.5 py-0 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[9px] shadow-2xs whitespace-nowrap"
                                  title="Margen de ganancia bajo"
                                >
                                  ⚠️ {marginPercent.toFixed(0)}% (+S/ {profit.toFixed(2)})
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center px-1.5 py-0 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[9px] shadow-2xs whitespace-nowrap"
                                  title="Margen de ganancia saludable"
                                >
                                  +{marginPercent.toFixed(0)}% (+S/ {profit.toFixed(2)})
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Subtotal */}
                          <td className="px-3 py-1.5 text-right font-black text-gray-900 text-xs">
                            S/ {subtotal.toFixed(2)}
                          </td>

                          {/* Quitar */}
                          <td className="px-2 py-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Eliminar producto"
                            >
                              <TbTrash size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
              <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg text-center space-y-1.5">
                <TbBox size={26} className="mx-auto text-gray-400" />
                <p className="text-xs font-bold text-gray-700">
                  Aún no has agregado productos a esta compra
                </p>
                <p className="text-[11px] text-gray-400">
                  Usa el buscador para seleccionar los productos que ingresarán al almacén.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha (1/3): Datos del Proveedor y Resumen Financiero */}
        <div className="space-y-4">
          {/* Card: Datos del Proveedor */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
                <TbBuildingStore size={17} className="text-purple-500" />
                <span>Datos del Proveedor</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(true)}
                className="text-xs font-bold text-[#3483fa] hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
              >
                <TbPlus size={13} />
                <span>Nuevo Proveedor</span>
              </button>
            </div>

            {/* Proveedor Seleccionado (Card) o Buscador con Autocomplete */}
            {selectedSupplier ? (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start justify-between gap-3 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-600 text-white">
                      {selectedSupplier.documentType || 'Proveedor'}
                    </span>
                    {selectedSupplier.documentNumber && (
                      <span className="text-[11px] font-mono font-semibold text-blue-950">
                        {selectedSupplier.documentNumber}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 mt-1 truncate">
                    {selectedSupplier.name}
                  </h3>
                  {selectedSupplier.contactName && (
                    <p className="text-[11px] text-gray-600 mt-0.5 truncate">
                      Contacto: <span className="font-medium text-gray-800">{selectedSupplier.contactName}</span>
                      {selectedSupplier.phone && ` • Tel: ${selectedSupplier.phone}`}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleClearSelectedSupplier}
                  title="Cambiar o quitar proveedor"
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-rose-200 shrink-0"
                >
                  <TbX size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Proveedor / Razón Social <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                    <TbSearch size={15} />
                  </div>
                  <input
                    type="text"
                    required
                    value={supplierSearch || supplierName}
                    onChange={(e) => {
                      setSupplierSearch(e.target.value);
                      setSupplierName(e.target.value);
                      setIsSupplierDropdownOpen(true);
                    }}
                    onFocus={() => setIsSupplierDropdownOpen(true)}
                    placeholder="Buscar por nombre, RUC o escribir nuevo..."
                    className="w-full pl-8 pr-8 py-1.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium shadow-2xs placeholder:text-gray-400"
                  />
                  {(supplierSearch || supplierName) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSupplierSearch('');
                        setSupplierName('');
                      }}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <TbX size={14} />
                    </button>
                  )}
                </div>

                {/* Dropdown flotante sobrio y limpio */}
                {isSupplierDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsSupplierDropdownOpen(false)}
                    />

                    <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-slate-100 border border-slate-300 rounded-lg shadow-xl overflow-hidden divide-y divide-slate-200">
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-200">
                        {filteredSuppliers.length > 0 ? (
                          filteredSuppliers.map((sup) => (
                            <button
                              key={sup.id}
                              type="button"
                              onClick={() => handleSelectSupplier(sup)}
                              className="w-full px-3 py-2 text-left hover:bg-slate-200/80 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                                  {sup.name}
                                </p>
                                <p className="text-[11px] text-slate-600 truncate">
                                  {sup.documentNumber ? `${sup.documentType || 'DOC'}: ${sup.documentNumber}` : ''}
                                  {sup.contactName ? ` • ${sup.contactName}` : ''}
                                </p>
                              </div>
                              <span className="text-[11px] text-slate-500 group-hover:text-blue-600 shrink-0 font-medium">
                                Seleccionar
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-slate-500 bg-slate-100">
                            No se encontraron proveedores
                          </div>
                        )}
                      </div>

                      <div className="p-2 bg-slate-200/70 border-t border-slate-300">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSupplierDropdownOpen(false);
                            setIsSupplierModalOpen(true);
                          }}
                          className="w-full py-1 text-center text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <TbPlus size={13} />
                          <span>Registrar nuevo proveedor</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Comprobante
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs cursor-pointer"
                >
                  <option value="Factura">Factura</option>
                  <option value="Boleta">Boleta</option>
                  <option value="Guía de Remisión">Guía de Remisión</option>
                  <option value="Nota de Entrada">Nota de Entrada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  N° Comprobante
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="F001-000492"
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Observaciones / Notas (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Condiciones de pago, lote, transportista, etc."
                className="w-full px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-y shadow-2xs placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Card: Resumen de la Inversión */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <h2 className="text-xs sm:text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <TbCurrencyDollar size={17} className="text-emerald-500" />
              <span>Resumen de la Inversión</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>Variedad de productos:</span>
                <strong className="text-gray-900">{items.length} ítems</strong>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Total unidades a ingresar:</span>
                <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  +{totalUnits} unid.
                </span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex items-baseline justify-between">
                <span className="font-bold text-gray-800 text-xs">Total Compra:</span>
                <span className="text-xl font-black text-emerald-600">
                  S/ {totalAmount.toFixed(2)}
                </span>
              </div>
              {items.some(
                (i) => Math.abs(i.salePrice - Number(i.product.price || 0)) > 0.001,
              ) && (
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold flex items-center gap-1.5">
                  <span>ℹ️ Se actualizarán los precios en catálogo al guardar.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full py-2.5 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-xs font-bold tracking-wide uppercase transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <TbLoader2 size={15} className="animate-spin" />
                  <span>Procesando Ingreso...</span>
                </>
              ) : (
                <>
                  <TbCheck size={16} />
                  <span>Guardar e Ingresar Stock</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>

    {/* Modal para Crear Proveedor al vuelo (FUERA DEL FORM PRINCIPAL) */}
    <SupplierModal
      isOpen={isSupplierModalOpen}
      supplier={null}
      onClose={() => setIsSupplierModalOpen(false)}
      onSuccess={(sup) => {
        handleSelectSupplier(sup);
      }}
    />
  </>
);
}

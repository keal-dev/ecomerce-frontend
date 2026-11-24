'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TbClipboardList,
  TbSearch,
  TbRefresh,
  TbAlertTriangle,
  TbPackage,
  TbArrowUpRight,
  TbArrowDownLeft,
  TbAdjustmentsHorizontal,
  TbPlus,
  TbMinus,
  TbCheck,
  TbX,
  TbEdit,
  TbCurrencyDollar,
  TbTruckDelivery,
  TbCategory,
  TbTag,
  TbArrowsUpDown,
  TbShoppingCart,
} from 'react-icons/tb';
import { getProducts, updateProduct } from '@/services/product.service';
import { getPurchases } from '@/services/purchase.service';
import { getOrders } from '@/services/order.service';
import { useCategoryStore } from '@/stores/category.store';
import { useBrandStore } from '@/stores/brand.store';
import { Product } from '@/types/product.types';
import { Purchase } from '@/types/purchase.types';
import { Order } from '@/types/order.types';

interface KardexMovement {
  id: string;
  date: string;
  type: 'IN' | 'OUT';
  reference: string;
  productTitle: string;
  productSku?: string | null;
  productImage?: string | null;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
  counterparty: string;
  environment?: string;
}

export function InventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { categories, fetchCategories } = useCategoryStore();
  const { brands, fetchBrands } = useBrandStore();

  // Pestañas: 'stock' (Existencias) | 'kardex' (Movimientos)
  const [activeTab, setActiveTab] = useState<'stock' | 'kardex'>('stock');

  // Filtros de Existencias
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [stockLevelFilter, setStockLevelFilter] = useState<'ALL' | 'AVAILABLE' | 'LOW' | 'OUT'>('ALL');

  // Filtros de Kardex
  const [kardexTypeFilter, setKardexTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [kardexSearch, setKardexSearch] = useState('');

  // Modal de Ajuste Rápido de Stock
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [adjustMode, setAdjustMode] = useState<'SET' | 'ADD' | 'SUBTRACT'>('ADD');
  const [adjustQty, setAdjustQty] = useState<string>('1');
  const [adjustCost, setAdjustCost] = useState<string>('');
  const [adjustSaving, setAdjustSaving] = useState(false);

  const loadInventoryData = async () => {
    setIsLoading(true);
    try {
      const [prodsData, purchData, ordData] = await Promise.all([
        getProducts(),
        getPurchases().catch(() => []),
        getOrders().catch(() => []),
      ]);
      setProducts(prodsData);
      setPurchases(purchData);
      setOrders(ordData);
    } catch (error) {
      console.error('Error al cargar datos de inventario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
    fetchCategories();
    fetchBrands();
  }, [fetchCategories, fetchBrands]);

  // Métricas Globales de Almacén
  const metrics = useMemo(() => {
    let totalUnits = 0;
    let totalCostValue = 0;
    let totalSaleValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      const stock = Number(p.stock) || 0;
      const price = Number(p.price) || 0;
      const cost = p.costPrice ? Number(p.costPrice) : price * 0.7;

      totalUnits += stock;
      totalCostValue += stock * cost;
      totalSaleValue += stock * price;

      if (stock <= 0) {
        outOfStockCount++;
      } else if (stock <= 5) {
        lowStockCount++;
      }
    });

    return {
      totalSkus: products.length,
      totalUnits,
      totalCostValue,
      totalSaleValue,
      lowStockCount,
      outOfStockCount,
    };
  }, [products]);

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const stock = Number(p.stock) || 0;

      // Nivel de stock
      if (stockLevelFilter === 'OUT' && stock > 0) return false;
      if (stockLevelFilter === 'LOW' && (stock <= 0 || stock > 5)) return false;
      if (stockLevelFilter === 'AVAILABLE' && stock <= 5) return false;

      // Categoría
      if (categoryFilter !== 'ALL' && p.categoryId !== categoryFilter) return false;

      // Marca
      if (brandFilter !== 'ALL' && p.brandId !== brandFilter) return false;

      // Búsqueda
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchSku = (p.sku || '').toLowerCase().includes(q);
        const matchCat = (p.category?.name || '').toLowerCase().includes(q);
        const matchBrand = (p.brand?.name || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSku && !matchCat && !matchBrand) return false;
      }

      return true;
    });
  }, [products, stockLevelFilter, categoryFilter, brandFilter, searchTerm]);

  // Construcción del Kardex (Entradas por Compras + Salidas por Pedidos)
  const kardexMovements = useMemo(() => {
    const list: KardexMovement[] = [];

    // 1. Entradas desde Compras a Proveedores
    purchases.forEach((pur) => {
      (pur.items || []).forEach((item) => {
        list.push({
          id: `in-${pur.id}-${item.id}`,
          date: pur.createdAt,
          type: 'IN',
          reference: pur.purchaseNumber || 'COMPRA',
          productTitle: item.product?.title || 'Producto abastecido',
          productSku: item.product?.sku || null,
          productImage: item.product?.imageUrl || null,
          quantity: Number(item.quantity) || 0,
          unitAmount: Number(item.costPrice) || 0,
          totalAmount: Number(item.subtotal) || 0,
          counterparty: pur.supplierName || 'Proveedor',
        });
      });
    });

    // 2. Salidas desde Pedidos Online (no cancelados)
    orders
      .filter((ord) => ord.orderStatus !== 'cancelled')
      .forEach((ord) => {
        (ord.items || []).forEach((item) => {
          list.push({
            id: `out-${ord.id}-${item.id}`,
            date: ord.createdAt,
            type: 'OUT',
            reference: ord.orderNumber.startsWith('#') ? ord.orderNumber : `#${ord.orderNumber}`,
            productTitle: item.productTitle,
            productSku: item.productSku,
            productImage: item.productImageUrl,
            quantity: Number(item.quantity) || 0,
            unitAmount: Number(item.unitPrice) || 0,
            totalAmount: Number(item.subtotal) || 0,
            counterparty: ord.customerName || 'Cliente Web',
            environment: ord.environment,
          });
        });
      });

    // Ordenar del más reciente al más antiguo
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchases, orders]);

  const filteredKardex = useMemo(() => {
    return kardexMovements.filter((mov) => {
      if (kardexTypeFilter !== 'ALL' && mov.type !== kardexTypeFilter) return false;
      if (kardexSearch.trim()) {
        const q = kardexSearch.toLowerCase().trim();
        return (
          mov.productTitle.toLowerCase().includes(q) ||
          mov.reference.toLowerCase().includes(q) ||
          mov.counterparty.toLowerCase().includes(q) ||
          (mov.productSku || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [kardexMovements, kardexTypeFilter, kardexSearch]);

  // Abrir modal de ajuste
  const openAdjustModal = (product: Product) => {
    setAdjustModalProduct(product);
    setAdjustMode('ADD');
    setAdjustQty('1');
    setAdjustCost(product.costPrice ? String(product.costPrice) : '');
  };

  // Guardar ajuste rápido de stock
  const handleSaveStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalProduct) return;

    const currentStock = Number(adjustModalProduct.stock) || 0;
    const inputQty = Math.max(0, parseInt(adjustQty, 10) || 0);

    let newStock = currentStock;
    if (adjustMode === 'SET') {
      newStock = inputQty;
    } else if (adjustMode === 'ADD') {
      newStock = currentStock + inputQty;
    } else if (adjustMode === 'SUBTRACT') {
      newStock = Math.max(0, currentStock - inputQty);
    }

    const dto: { stock: number; costPrice?: number } = { stock: newStock };
    if (adjustCost.trim() !== '' && !isNaN(Number(adjustCost))) {
      dto.costPrice = Number(adjustCost);
    }

    setAdjustSaving(true);
    try {
      const updated = await updateProduct(adjustModalProduct.id, dto);
      setProducts((prev) =>
        prev.map((p) => (p.id === adjustModalProduct.id ? { ...p, ...updated, stock: newStock } : p)),
      );
      setAdjustModalProduct(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar el stock del producto');
    } finally {
      setAdjustSaving(false);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <TbX size={12} /> Agotado (0)
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <TbAlertTriangle size={12} className="text-amber-600" /> Crítico ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <TbCheck size={12} /> Óptimo ({stock})
      </span>
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <TbClipboardList className="w-6 h-6 text-indigo-600" />
            <span>Inventario y Kardex de Almacén</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Control de existencias físicas, valorización de mercadería, alertas de reposición y flujo de entradas/salidas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadInventoryData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <TbRefresh className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <Link
            href="/admin/purchases/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
          >
            <TbTruckDelivery size={16} />
            <span>Abastecer Stock (Nueva Compra)</span>
          </Link>
        </div>
      </div>

      {/* KPIs Compactos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Unidades Físicas Totales</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{metrics.totalUnits}</span>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {metrics.totalSkus} SKUs
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">En catálogo activo</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Valorizado en Venta (PVP)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">
              S/ {metrics.totalSaleValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Potencial
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Costo est.: S/ {metrics.totalCostValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div
          onClick={() => {
            setActiveTab('stock');
            setStockLevelFilter(stockLevelFilter === 'LOW' ? 'ALL' : 'LOW');
          }}
          className={`p-4 rounded-xl border shadow-2xs cursor-pointer transition-all ${
            stockLevelFilter === 'LOW'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200/90 hover:border-amber-200'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 block">Stock Crítico (1 a 5 unid.)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-600">{metrics.lowStockCount}</span>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Por agotar
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Clic para filtrar urgentes</span>
        </div>

        <div
          onClick={() => {
            setActiveTab('stock');
            setStockLevelFilter(stockLevelFilter === 'OUT' ? 'ALL' : 'OUT');
          }}
          className={`p-4 rounded-xl border shadow-2xs cursor-pointer transition-all ${
            stockLevelFilter === 'OUT'
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200/90 hover:border-rose-200'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 block">Productos Agotados (0)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-rose-600">{metrics.outOfStockCount}</span>
            <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
              Sin Stock
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Clic para filtrar agotados</span>
        </div>
      </div>

      {/* Selector de Pestañas: Existencias vs Movimientos Kardex */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'stock'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TbPackage size={17} />
          <span>Existencias y Ajustes ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kardex')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'kardex'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TbArrowsUpDown size={17} />
          <span>Kardex de Movimientos ({kardexMovements.length})</span>
        </button>
      </div>

      {/* PESTAÑA 1: EXISTENCIAS DE ALMACÉN */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar producto por nombre, SKU, marca o categoría..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={stockLevelFilter}
                onChange={(e) => setStockLevelFilter(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todos los niveles de stock</option>
                <option value="AVAILABLE">Óptimo (&gt; 5 unid.)</option>
                <option value="LOW">Crítico (1 - 5 unid.)</option>
                <option value="OUT">Agotados (0 unid.)</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todas las marcas</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {(searchTerm || stockLevelFilter !== 'ALL' || categoryFilter !== 'ALL' || brandFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setStockLevelFilter('ALL');
                    setCategoryFilter('ALL');
                    setBrandFilter('ALL');
                  }}
                  className="px-2.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Tabla de Existencias */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {isLoading && products.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Cargando inventario físico...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <TbPackage className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700 text-sm">No se encontraron productos con estos filtros</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Producto / SKU</th>
                      <th className="px-5 py-3.5">Categoría & Marca</th>
                      <th className="px-5 py-3.5">Costo Unit.</th>
                      <th className="px-5 py-3.5">Precio Venta</th>
                      <th className="px-5 py-3.5">Estado Stock</th>
                      <th className="px-5 py-3.5">Valorizado</th>
                      <th className="px-5 py-3.5 text-right">Acciones de Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((prod) => {
                      const stock = Number(prod.stock) || 0;
                      const price = Number(prod.price) || 0;
                      const cost = prod.costPrice ? Number(prod.costPrice) : null;
                      const totalVal = stock * price;

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Producto */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {prod.imageUrl ? (
                                  <img
                                    src={prod.imageUrl}
                                    alt={prod.title}
                                    className="w-full h-full object-contain p-0.5"
                                  />
                                ) : (
                                  <TbPackage size={18} className="text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0 max-w-[240px]">
                                <div className="font-bold text-slate-900 truncate" title={prod.title}>
                                  {prod.title}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  SKU: {prod.sku || prod.id.slice(0, 8).toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Categoría y Marca */}
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-slate-800">
                              {prod.category?.name || 'Sin categoría'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {prod.brand?.name || 'Genérico'}
                            </div>
                          </td>

                          {/* Costo */}
                          <td className="px-5 py-3.5 text-slate-600 font-medium whitespace-nowrap">
                            {cost !== null ? `S/ ${cost.toFixed(2)}` : <span className="text-slate-400 italic">No reg.</span>}
                          </td>

                          {/* Precio Venta */}
                          <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                            S/ {price.toFixed(2)}
                          </td>

                          {/* Estado Stock */}
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {getStockBadge(stock)}
                          </td>

                          {/* Valorizado */}
                          <td className="px-5 py-3.5 font-bold text-indigo-950 whitespace-nowrap">
                            S/ {totalVal.toFixed(2)}
                          </td>

                          {/* Acciones */}
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => openAdjustModal(prod)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                title="Ajustar conteo físico o sumar unidades"
                              >
                                <TbAdjustmentsHorizontal size={14} />
                                <span>Ajustar</span>
                              </button>

                              <Link
                                href={`/admin/products/${prod.id}/edit`}
                                className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                title="Editar ficha completa del producto"
                              >
                                <TbEdit size={15} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: KARDEX DE MOVIMIENTOS (ENTRADAS Y SALIDAS) */}
      {activeTab === 'kardex' && (
        <div className="space-y-4">
          {/* Barra de Filtros Kardex */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={kardexSearch}
                onChange={(e) => setKardexSearch(e.target.value)}
                placeholder="Buscar por producto, #orden, factura de compra, proveedor o cliente..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setKardexTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  kardexTypeFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setKardexTypeFilter('IN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  kardexTypeFilter === 'IN'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <TbArrowDownLeft size={14} />
                <span>Entradas (Compras)</span>
              </button>
              <button
                type="button"
                onClick={() => setKardexTypeFilter('OUT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  kardexTypeFilter === 'OUT'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <TbArrowUpRight size={14} />
                <span>Salidas (Ventas)</span>
              </button>
            </div>
          </div>

          {/* Tabla de Movimientos */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {filteredKardex.length === 0 ? (
              <div className="p-12 text-center">
                <TbArrowsUpDown className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700 text-sm">No se encontraron movimientos registrados</p>
                <p className="text-xs text-slate-400 mt-1">
                  Cada compra a proveedores y cada venta en la tienda se registran automáticamente aquí.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Fecha</th>
                      <th className="px-5 py-3.5">Tipo</th>
                      <th className="px-5 py-3.5">Referencia</th>
                      <th className="px-5 py-3.5">Producto</th>
                      <th className="px-5 py-3.5">Proveedor / Cliente</th>
                      <th className="px-5 py-3.5 text-center">Cantidad</th>
                      <th className="px-5 py-3.5 text-right">Monto Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredKardex.map((mov) => {
                      const isEntry = mov.type === 'IN';
                      return (
                        <tr key={mov.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                            {new Date(mov.date).toLocaleDateString('es-PE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {isEntry ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <TbArrowDownLeft size={12} /> ENTRADA
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <TbArrowUpRight size={12} /> SALIDA
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 font-mono font-bold text-slate-800 whitespace-nowrap">
                            {mov.reference}
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-slate-900 truncate max-w-[230px]">
                              {mov.productTitle}
                            </div>
                          </td>

                          <td className="px-5 py-3.5 text-slate-600">
                            {mov.counterparty}
                          </td>

                          <td className="px-5 py-3.5 text-center whitespace-nowrap">
                            <span
                              className={`font-extrabold text-sm ${
                                isEntry ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {isEntry ? `+${mov.quantity}` : `-${mov.quantity}`}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                            S/ {mov.totalAmount.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE AJUSTE RÁPIDO DE STOCK */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TbAdjustmentsHorizontal size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ajustar Stock de Almacén</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[260px]">
                    {adjustModalProduct.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdjustModalProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <TbX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium">Stock actual en sistema:</span>
                <span className="text-base font-black text-slate-900">
                  {adjustModalProduct.stock} unidades
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Tipo de Operación</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustMode('ADD')}
                    className={`py-2 px-2 rounded-xl font-bold border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      adjustMode === 'ADD'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/15'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <TbPlus size={16} />
                    <span>Sumar Entrada</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustMode('SUBTRACT')}
                    className={`py-2 px-2 rounded-xl font-bold border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      adjustMode === 'SUBTRACT'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/15'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <TbMinus size={16} />
                    <span>Restar Salida</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustMode('SET')}
                    className={`py-2 px-2 rounded-xl font-bold border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      adjustMode === 'SET'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-500/15'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <TbCheck size={16} />
                    <span>Fijar Exacto</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {adjustMode === 'SET' ? 'Nuevo Stock Total' : 'Cantidad de Unidades'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Costo Unitario (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="S/ 0.00"
                    value={adjustCost}
                    onChange={(e) => setAdjustCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Previsualización del resultado */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
                <span className="text-indigo-900 font-semibold">Stock resultante final:</span>
                <span className="text-base font-black text-indigo-700">
                  {adjustMode === 'SET'
                    ? Math.max(0, parseInt(adjustQty, 10) || 0)
                    : adjustMode === 'ADD'
                    ? (Number(adjustModalProduct.stock) || 0) + Math.max(0, parseInt(adjustQty, 10) || 0)
                    : Math.max(0, (Number(adjustModalProduct.stock) || 0) - Math.max(0, parseInt(adjustQty, 10) || 0))}{' '}
                  unidades
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalProduct(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={adjustSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition-colors shadow-xs cursor-pointer"
                >
                  {adjustSaving ? 'Guardando...' : 'Aplicar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


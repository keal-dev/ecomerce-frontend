'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  TbCoin,
  TbShoppingCart,
  TbBox,
  TbUsers,
  TbPlus,
  TbArrowUpRight,
  TbEye,
  TbCategory,
  TbRefresh,
  TbFileInvoice,
  TbAlertTriangle,
  TbCheck,
  TbClock,
  TbTruckDelivery,
  TbX,
  TbShieldCheck,
  TbReceipt,
} from 'react-icons/tb';
import { useAuthStore } from '@/stores/auth.store';
import { useCompanyStore } from '@/stores/company.store';
import { getOrders } from '@/services/order.service';
import { getProducts } from '@/services/product.service';
import { getUsers } from '@/services/user.service';
import { useCategoryStore } from '@/stores/category.store';
import { Order, OrderStatus } from '@/types/order.types';
import { Product } from '@/types/product.types';
import { User } from '@/types/user.types';
import { SalesAnalyticsSection } from './SalesAnalyticsSection';

export function Dashboard() {
  const { currentUser } = useAuthStore();
  const { company } = useCompanyStore();
  const { categories, fetchCategories } = useCategoryStore();

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isSeller = currentUser?.role === 'seller';
  const currencySymbol = company?.currencySymbol || 'S/';

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [envFilter, setEnvFilter] = useState<'ALL' | 'production' | 'test'>('ALL');

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordData, prodData, usrData] = await Promise.all([
        getOrders().catch(() => []),
        getProducts().catch(() => []),
        isSuperAdmin ? getUsers().catch(() => []) : Promise.resolve([]),
      ]);
      setOrders(ordData);
      setProducts(prodData);
      setUsers(usrData);
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    loadDashboardData();
    fetchCategories();
  }, [loadDashboardData, fetchCategories]);

  // Filtrar pedidos según selector de entorno (Todos, Producción o Test)
  const filteredOrders = useMemo(() => {
    if (envFilter === 'ALL') return orders;
    return orders.filter((o) => o.environment === envFilter);
  }, [orders, envFilter]);

  // Cálculo de KPIs en tiempo real
  const kpis = useMemo(() => {
    const validOrders = filteredOrders.filter((o) => o.orderStatus !== 'cancelled');
    const totalSales = validOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthOrders = validOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthSales = monthOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    const pendingDispatch = filteredOrders.filter(
      (o) => o.orderStatus === 'pending' || o.orderStatus === 'preparing',
    ).length;

    const invoicesEmitted = filteredOrders.filter((o) => Boolean(o.invoicePdfUrl)).length;

    const activeProducts = products.filter((p) => p.isActive !== false).length;
    const outOfStock = products.filter((p) => (Number(p.stock) || 0) <= 0).length;
    const lowStock = products.filter((p) => {
      const s = Number(p.stock) || 0;
      return s > 0 && s <= 5;
    }).length;

    // Clientes únicos (combinando correos de pedidos + usuarios registrados)
    const uniqueEmails = new Set<string>();
    users.forEach((u) => {
      if (u.email) uniqueEmails.add(u.email.toLowerCase());
    });
    filteredOrders.forEach((o) => {
      if (o.customerEmail) uniqueEmails.add(o.customerEmail.toLowerCase());
    });

    return {
      totalSales,
      monthSales,
      totalOrdersCount: filteredOrders.length,
      pendingDispatch,
      invoicesEmitted,
      activeProducts,
      outOfStock,
      lowStock,
      totalCustomers: uniqueEmails.size,
      registeredUsersCount: users.length,
    };
  }, [filteredOrders, products, users]);

  // Últimos 7 pedidos reales
  const recentOrders = useMemo(() => {
    return filteredOrders.slice(0, 7);
  }, [filteredOrders]);

  // Categorías principales reales con conteo de productos y ventas reales
  const categoryStats = useMemo(() => {
    // Mapa de ventas por productId
    const salesByProductId = new Map<string, number>();
    filteredOrders
      .filter((o) => o.orderStatus !== 'cancelled')
      .forEach((o) => {
        (o.items || []).forEach((it) => {
          if (it.productId) {
            salesByProductId.set(
              it.productId,
              (salesByProductId.get(it.productId) || 0) + (Number(it.subtotal) || 0),
            );
          }
        });
      });

    const statsList = categories.map((cat) => {
      const catProducts = products.filter((p) => p.categoryId === cat.id);
      const catSales = catProducts.reduce(
        (acc, p) => acc + (salesByProductId.get(p.id) || 0),
        0,
      );
      const stockUnits = catProducts.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);

      return {
        id: cat.id,
        name: cat.name,
        productCount: catProducts.length,
        stockUnits,
        sales: catSales,
      };
    });

    return statsList
      .sort((a, b) => b.sales - a.sales || b.productCount - a.productCount)
      .slice(0, 5);
  }, [categories, products, filteredOrders]);

  // Productos con stock crítico o agotado (para alerta rápida)
  const criticalProducts = useMemo(() => {
    return products
      .filter((p) => (Number(p.stock) || 0) <= 5)
      .sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0))
      .slice(0, 4);
  }, [products]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <TbClock size={12} /> En Preparación
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <TbTruckDelivery size={12} /> En Camino
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TbCheck size={12} /> Entregado
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <TbX size={12} /> Cancelado
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <TbClock size={12} /> Confirmado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header / Actions row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Resumen General
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Métricas de ventas, facturación electrónica e inventario de tu tienda en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Entorno */}
          <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setEnvFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                envFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setEnvFilter('production')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                envFilter === 'production'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              PROD
            </button>
            <button
              type="button"
              onClick={() => setEnvFilter('test')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                envFilter === 'test'
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              TEST
            </button>
          </div>

          <button
            type="button"
            onClick={loadDashboardData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <TbRefresh size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>

          {isSuperAdmin ? (
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 bg-[#111111] hover:bg-brand-accent text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg shadow-2xs transition-colors"
            >
              <TbPlus size={16} />
              <span>Nuevo Producto</span>
            </Link>
          ) : (
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 bg-[#111111] hover:bg-brand-accent text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg shadow-2xs transition-colors"
            >
              <TbShoppingCart size={16} />
              <span>Ver Pedidos</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Reales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ventas */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Ventas Acumuladas
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TbCoin size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="text-2xl font-bold text-gray-900 tracking-tight">
              {currencySymbol}{' '}
              {kpis.totalSales.toLocaleString('es-PE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {kpis.invoicesEmitted} comprobantes
            </span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1">
            Este mes: {currencySymbol} {kpis.monthSales.toFixed(2)}
          </span>
        </div>

        {/* Card 2: Pedidos */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Pedidos Totales
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <TbShoppingCart size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="text-2xl font-bold text-gray-900 tracking-tight">
              {kpis.totalOrdersCount}
            </div>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                kpis.pendingDispatch > 0
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {kpis.pendingDispatch} por despachar
            </span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1">
            Órdenes registradas en tienda
          </span>
        </div>

        {/* Card 3: Productos */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Productos Activos
            </span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <TbBox size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="text-2xl font-bold text-gray-900 tracking-tight">
              {kpis.activeProducts}
            </div>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                kpis.outOfStock > 0
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {kpis.outOfStock > 0 ? `${kpis.outOfStock} sin stock` : 'Todo con stock'}
            </span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1">
            {kpis.lowStock} con stock crítico (&le; 5 unid.)
          </span>
        </div>

        {/* Card 4: Clientes / Usuarios */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Clientes & Usuarios
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <TbUsers size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="text-2xl font-bold text-gray-900 tracking-tight">
              {kpis.totalCustomers}
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {kpis.registeredUsersCount} cuentas
            </span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1">
            Compradores únicos y usuarios
          </span>
        </div>
      </div>

      {/* Gráficos Estadísticos de Ventas */}
      <SalesAnalyticsSection
        orders={filteredOrders}
        currencySymbol={currencySymbol}
        isLoading={isLoading}
      />

      {/* Main Content Grid: Pedidos Recientes + Lateral info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Pedidos Recientes Reales */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 text-base">Pedidos Recientes</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Últimas órdenes reales procesadas en tu base de datos
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-brand-accent hover:underline font-medium inline-flex items-center gap-1"
            >
              Ver todos <TbArrowUpRight size={13} />
            </Link>
          </div>

          {isLoading && recentOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">
              <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Cargando pedidos reales...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <TbShoppingCart className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-semibold text-gray-700">Aún no hay pedidos registrados</p>
              <p className="text-xs text-gray-400">
                Cuando se realice una compra en la tienda aparecerá aquí al instante.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 text-gray-500 text-[11px] font-semibold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Pedido</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Comprobante</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#111111]">
                            {order.orderNumber.startsWith('#')
                              ? order.orderNumber
                              : `#${order.orderNumber}`}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${
                              order.environment === 'production'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {order.environment === 'production' ? 'PROD' : 'TEST'}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 truncate max-w-[160px]">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[160px]">
                          {order.customerEmail}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {order.invoicePdfUrl ? (
                          <a
                            href={order.invoicePdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-bold text-[11px] transition-colors"
                          >
                            <TbFileInvoice size={13} className="text-emerald-600" />
                            <span>
                              {order.invoiceSeries}-{order.invoiceNumber}
                            </span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">
                            {order.invoiceType === 'factura' ? 'Factura pend.' : 'Boleta pend.'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                        {order.currencySymbol || currencySymbol} {Number(order.total).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(order.orderStatus)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href="/admin/orders"
                          className="p-1.5 inline-flex text-gray-400 hover:text-brand-accent hover:bg-red-50 rounded-lg transition-colors"
                          title="Ir al módulo de pedidos"
                        >
                          <TbEye size={17} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column (1/3): Categorías Reales, Alertas de Stock y Accesos */}
        <div className="space-y-6">
          {/* Alertas de Stock Crítico */}
          {criticalProducts.length > 0 && (
            <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <TbAlertTriangle size={16} className="text-amber-600" />
                  <span>Alertas de Stock en Almacén</span>
                </div>
                <Link
                  href="/admin/inventory"
                  className="text-[11px] font-bold text-amber-800 hover:underline"
                >
                  Ver Kardex
                </Link>
              </div>
              <div className="space-y-2">
                {criticalProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between bg-white p-2 rounded-lg border border-amber-200/70 text-xs"
                  >
                    <span className="font-medium text-gray-800 truncate pr-2">
                      {prod.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        Number(prod.stock) <= 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {Number(prod.stock) <= 0 ? 'Agotado' : `${prod.stock} unid.`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categorías Reales */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <TbCategory size={18} className="text-gray-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Categorías de la Tienda</h3>
              </div>
              {isSuperAdmin && (
                <Link
                  href="/admin/categories"
                  className="text-xs text-brand-accent hover:underline font-medium"
                >
                  Gestionar
                </Link>
              )}
            </div>

            {categoryStats.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                No hay categorías registradas
              </p>
            ) : (
              <div className="space-y-3">
                {categoryStats.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between text-xs">
                    <div className="truncate pr-2">
                      <p className="font-medium text-gray-800 truncate">{cat.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {cat.productCount} {cat.productCount === 1 ? 'producto' : 'productos'} •{' '}
                        {cat.stockUnits} en stock
                      </p>
                    </div>
                    <span className="font-semibold text-gray-700 shrink-0">
                      {currencySymbol} {cat.sales.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accesos Rápidos */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Accesos Rápidos</h3>
            <div className="space-y-2">
              {isSuperAdmin && (
                <>
                  <Link
                    href="/admin/products"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
                  >
                    <span>📦 Catálogo central de productos</span>
                    <TbArrowUpRight size={14} className="text-gray-400" />
                  </Link>
                </>
              )}
              <Link
                href="/admin/orders"
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
              >
                <span>🛍️ Pedidos de la tienda online</span>
                <TbArrowUpRight size={14} className="text-gray-400" />
              </Link>
              <Link
                href="/admin/billing"
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
              >
                <span>🧾 Facturación electrónica SUNAT</span>
                <TbArrowUpRight size={14} className="text-gray-400" />
              </Link>
              <Link
                href="/admin/sales"
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
              >
                <span>🛒 Punto de venta (POS tienda física)</span>
                <TbArrowUpRight size={14} className="text-gray-400" />
              </Link>
              {!isSeller && (
                <Link
                  href="/admin/inventory"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
                >
                  <span>📋 Control de inventario y Kardex</span>
                  <TbArrowUpRight size={14} className="text-gray-400" />
                </Link>
              )}
              <Link
                href="/"
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
              >
                <span>🏪 Ir a la tienda en vivo</span>
                <TbArrowUpRight size={14} className="text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

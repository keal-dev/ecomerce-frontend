'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TbCoin, 
  TbShoppingCart, 
  TbBox, 
  TbUsers, 
  TbPlus, 
  TbArrowUpRight, 
  TbEye,
  TbCategory
} from 'react-icons/tb';
import { useAuthStore } from '@/stores/auth.store';

const stats = [
  {
    name: 'Ventas del Mes',
    value: 'S/ 14,850.00',
    change: '+12.4%',
    changeType: 'positive',
    icon: TbCoin,
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
  {
    name: 'Pedidos Totales',
    value: '154',
    change: '+8.1%',
    changeType: 'positive',
    icon: TbShoppingCart,
    iconBg: 'bg-blue-50 text-blue-600',
  },
  {
    name: 'Productos Activos',
    value: '36',
    change: '3 sin stock',
    changeType: 'neutral',
    icon: TbBox,
    iconBg: 'bg-violet-50 text-violet-600',
  },
  {
    name: 'Clientes Registrados',
    value: '88',
    change: '+14 nuevos',
    changeType: 'positive',
    icon: TbUsers,
    iconBg: 'bg-amber-50 text-amber-600',
  },
];

const recentOrders = [
  {
    id: '#ORD-9821',
    customer: 'Carlos Mendoza',
    email: 'carlos.m@example.com',
    date: 'Hoy, 10:45 AM',
    total: 'S/ 389.00',
    status: 'Completado',
    statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: '#ORD-9820',
    customer: 'María Fernández',
    email: 'maria.f@example.com',
    date: 'Hoy, 09:12 AM',
    total: 'S/ 1,240.00',
    status: 'Enviado',
    statusClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: '#ORD-9819',
    customer: 'Jorge Ramos',
    email: 'jorge.r@example.com',
    date: 'Ayer, 06:30 PM',
    total: 'S/ 85.00',
    status: 'Pendiente',
    statusClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: '#ORD-9818',
    customer: 'Lucía Gutiérrez',
    email: 'lucia.g@example.com',
    date: 'Ayer, 03:15 PM',
    total: 'S/ 520.00',
    status: 'Completado',
    statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: '#ORD-9817',
    customer: 'Diego Salazar',
    email: 'diego.s@example.com',
    date: '10 Oct, 11:20 AM',
    total: 'S/ 210.00',
    status: 'Completado',
    statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

const topCategories = [
  { name: 'Tecnología y Computación', count: 14, sales: 'S/ 8,420.00' },
  { name: 'Electrodomésticos', count: 9, sales: 'S/ 3,950.00' },
  { name: 'Moda y Calzado', count: 8, sales: 'S/ 1,680.00' },
  { name: 'Hogar y Muebles', count: 5, sales: 'S/ 800.00' },
];

export function Dashboard() {
  const { currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isSeller = currentUser?.role === 'seller';

  return (
    <div className="space-y-6">
      {/* Header / Actions row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Resumen General
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Métricas de ventas y pedidos de tu tienda en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isSuperAdmin ? (
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 bg-[#3483fa] hover:bg-blue-600 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg shadow-2xs transition-colors"
            >
              <TbPlus size={16} />
              <span>Nuevo Producto</span>
            </Link>
          ) : (
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 bg-[#3483fa] hover:bg-blue-600 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg shadow-2xs transition-colors"
            >
              <TbShoppingCart size={16} />
              <span>Ver Pedidos</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-gray-500">
                  {stat.name}
                </span>
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-2xl font-bold text-gray-900 tracking-tight">
                  {stat.value}
                </div>
                <span className={`text-xs font-semibold ${
                  stat.changeType === 'positive' 
                    ? 'text-emerald-600' 
                    : 'text-gray-500'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid: Pedidos Recientes + Lateral info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3): Pedidos Recientes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 text-base">Pedidos Recientes</h2>
              <p className="text-xs text-gray-400 mt-0.5">Últimas transacciones procesadas</p>
            </div>
            <Link 
              href="/admin/orders" 
              className="text-xs text-[#3483fa] hover:underline font-medium inline-flex items-center gap-1"
            >
              Ver todos <TbArrowUpRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50/80 text-gray-500 text-[11px] font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-5">Pedido</th>
                  <th className="py-3 px-5">Cliente</th>
                  <th className="py-3 px-5">Fecha</th>
                  <th className="py-3 px-5">Total</th>
                  <th className="py-3 px-5">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-gray-900 whitespace-nowrap">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.customer}</div>
                      <div className="text-[11px] text-gray-400">{order.email}</div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-500 whitespace-nowrap text-xs">
                      {order.date}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-gray-900 whitespace-nowrap">
                      {order.total}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${order.statusClass}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button 
                        type="button" 
                        aria-label="Ver detalles"
                        className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                      >
                        <TbEye size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1/3): Categorías y Accesos directos */}
        <div className="space-y-6">
          {/* Categorías más activas */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <TbCategory size={18} className="text-gray-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Categorías Principales</h3>
              </div>
              {isSuperAdmin && (
                <Link href="/admin/categories" className="text-xs text-[#3483fa] hover:underline font-medium">
                  Gestionar
                </Link>
              )}
            </div>

            <div className="space-y-3">
              {topCategories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <p className="font-medium text-gray-800 truncate">{cat.name}</p>
                    <p className="text-[11px] text-gray-400">{cat.count} productos</p>
                  </div>
                  <span className="font-semibold text-gray-700 shrink-0">
                    {cat.sales}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones Rápidas */}
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
                  <Link
                    href="/admin/categories"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
                  >
                    <span>🗂️ Administrar categorías</span>
                    <TbArrowUpRight size={14} className="text-gray-400" />
                  </Link>
                </>
              )}
              <Link
                href="/admin/orders"
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
              >
                <span>📦 Pedidos de la tienda online</span>
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
                  <span>📋 Control de inventario</span>
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

'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TbBuildingStore, 
  TbBuilding, 
  TbUsers, 
  TbReceipt, 
  TbTruckDelivery, 
  TbBell, 
  TbChevronRight,
  TbSettings,
  TbCash,
  TbPhotoVideo,
} from 'react-icons/tb';
import { useAuthStore } from '@/stores/auth.store';

interface SettingCard {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  iconColor: string;
  iconBg: string;
  isAvailable: boolean;
  superAdminOnly?: boolean;
}

const SETTING_CARDS: SettingCard[] = [
  {
    title: 'Apertura y Cierre de Caja',
    description: 'Fondo inicial, arqueo y cuadre de turnos del negocio.',
    href: '/admin/settings/cash-register',
    icon: TbCash,
    badge: 'Operativo',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    iconColor: 'text-[#00a650]',
    iconBg: 'bg-emerald-50',
    isAvailable: true,
  },
  {
    title: 'Datos de la Empresa',
    description: 'Logo, marca, RUC, moneda y contacto.',
    href: '/admin/settings/company',
    icon: TbBuilding,
    badge: 'Disponible',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    isAvailable: true,
    superAdminOnly: true,
  },
  {
    title: 'Banners y Marketing',
    description: 'Carrusel principal de la tienda, anuncios y promociones.',
    href: '/admin/settings/marketing',
    icon: TbPhotoVideo,
    badge: 'Disponible',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    isAvailable: true,
    superAdminOnly: true,
  },
  {
    title: 'Usuarios y Roles',
    description: 'Permisos para administradores y vendedores.',
    href: '/admin/settings/users',
    icon: TbUsers,
    badge: 'Disponible',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    isAvailable: true,
    superAdminOnly: true,
  },
  {
    title: 'Facturación y Comprobantes',
    description: 'Series de boletas, facturas y correlativos.',
    href: '#',
    icon: TbReceipt,
    badge: 'Fiscal',
    badgeColor: 'bg-gray-100 text-gray-500',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    isAvailable: false,
  },
  {
    title: 'Envíos y Logística',
    description: 'Zonas de cobertura, tarifas y retiro.',
    href: '#',
    icon: TbTruckDelivery,
    badge: 'Despacho',
    badgeColor: 'bg-gray-100 text-gray-500',
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50',
    isAvailable: false,
    superAdminOnly: true,
  },
  {
    title: 'Notificaciones y Alertas',
    description: 'Avisos por correo de pedidos y stock.',
    href: '#',
    icon: TbBell,
    badge: 'Alertas',
    badgeColor: 'bg-gray-100 text-gray-500',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    isAvailable: false,
  },
];

export default function AdminSettingsHubPage() {
  const { currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const visibleCards = SETTING_CARDS.filter(
    (card) => isSuperAdmin || !card.superAdminOnly,
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Cabecera del Hub de Configuración */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-brand/40 text-gray-800 text-[11px] font-bold mb-2">
            <TbSettings size={14} />
            <span>PANEL DE CONTROL</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Configuración del Sistema
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Personaliza los parámetros globales del negocio, empresa, usuarios y control de caja.
          </p>
        </div>
      </div>

      {/* Grid de Cards de Configuración */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {visibleCards.map((card) => {
          const Icon = card.icon;

          const CardInner = (
            <>
              <div>
                {/* Header de la Card: Icono + Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shadow-2xs`}>
                    <Icon size={15} />
                  </div>

                  {card.badge && (
                    <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  )}
                </div>

                {/* Título y Descripción */}
                <h3 className="font-bold text-[12px] text-gray-900 group-hover:text-[#3483fa] transition-colors leading-tight truncate">
                  {card.title}
                </h3>
                <p className="text-[10.5px] text-gray-500 mt-1 leading-snug line-clamp-2">
                  {card.description}
                </p>
              </div>

              {/* Pie de la Card con botón/enlace de acción */}
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10.5px] font-semibold">
                <span className={`truncate mr-1 ${card.isAvailable ? 'text-[#3483fa]' : 'text-gray-400'}`}>
                  {card.isAvailable ? 'Configurar' : 'Pronto'}
                </span>

                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                  card.isAvailable 
                    ? 'bg-blue-50 text-[#3483fa] group-hover:bg-[#3483fa] group-hover:text-white group-hover:translate-x-0.5' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <TbChevronRight size={12} />
                </div>
              </div>
            </>
          );

          if (card.isAvailable) {
            return (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white rounded-xl border border-gray-200/90 hover:border-[#3483fa] hover:shadow-md cursor-pointer p-3 flex flex-col justify-between transition-all duration-200 group relative"
              >
                {CardInner}
              </Link>
            );
          }

          return (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-gray-200/60 opacity-80 p-3 flex flex-col justify-between cursor-default group relative"
            >
              {CardInner}
            </div>
          );
        })}
      </div>
    </div>
  );
}

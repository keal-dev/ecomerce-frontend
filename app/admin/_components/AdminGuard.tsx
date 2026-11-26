'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAuthStore } from '@/stores/auth.store';
import { TbShieldLock } from 'react-icons/tb';

const ALLOWED_ROLES = ['admin', 'super_admin', 'seller'];

const SUPER_ADMIN_PREFIXES = [
  '/admin/products',
  '/admin/categories',
  '/admin/brands',
  '/admin/settings/company',
  '/admin/settings/users',
  '/admin/settings/marketing',
  '/admin/settings/billing',
  '/admin/settings/database-reset',
];

const SELLER_FORBIDDEN_PREFIXES = [
  '/admin/inventory',
  '/admin/purchases',
  '/admin/claims',
  '/admin/settings',
];

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();
  const { currentUser, isLoading } = useAuthStore();

  const isChecking = !isLoaded || (isSignedIn && (!currentUser || isLoading));
  const isAuthorized = Boolean(
    isSignedIn &&
      currentUser &&
      currentUser.isActive !== false &&
      ALLOWED_ROLES.includes(currentUser.role)
  );

  // Verificación de rutas restringidas por rol
  const isSuperAdminRoute = useMemo(
    () => SUPER_ADMIN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
    [pathname]
  );

  const isSellerForbiddenRoute = useMemo(
    () => SELLER_FORBIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
    [pathname]
  );

  const isRouteForbidden = Boolean(
    currentUser &&
      ((isSuperAdminRoute && currentUser.role !== 'super_admin') ||
        (isSellerForbiddenRoute && currentUser.role === 'seller'))
  );

  useEffect(() => {
    if (!isChecking) {
      if (!isAuthorized) {
        router.replace('/');
      } else if (isRouteForbidden) {
        router.replace('/admin');
      }
    }
  }, [isChecking, isAuthorized, isRouteForbidden, router]);

  // Pantalla de carga mientras se verifican credenciales
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#ebebeb] flex flex-col justify-center items-center gap-4 select-none">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[2.5px] border-black/10 border-t-brand-accent animate-spin" />
          <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-icon.png"
              alt="Cargando"
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-600">
          Verificando acceso
        </span>
      </div>
    );
  }

  // Si no tiene ningún rol de staff o está inactivo
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#ebebeb] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200 flex flex-col items-center max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-brand-accent flex items-center justify-center mb-3.5">
            <TbShieldLock size={26} />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Acceso Denegado</h2>
          <p className="text-xs text-gray-500 mt-1">
            Tu cuenta no tiene permisos para acceder al panel de administración. Redirigiendo a la tienda...
          </p>
        </div>
      </div>
    );
  }

  // Si intenta acceder a una sección restringida para su rol (ej. Admin ingresando a Catálogo o Configuración)
  if (isRouteForbidden) {
    return (
      <div className="min-h-screen bg-[#ebebeb] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-3.5">
            <TbShieldLock size={26} className="text-brand-accent" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Acceso Restringido</h2>
          <p className="text-xs text-gray-500 mt-1">
            Esta sección está reservada exclusivamente para el Super Administrador. Redirigiendo al panel...
          </p>
        </div>
      </div>
    );
  }

  // Usuario autorizado y en ruta permitida
  return <>{children}</>;
};


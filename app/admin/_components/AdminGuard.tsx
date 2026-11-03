'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAuthStore } from '@/stores/auth.store';
import { TbShieldLock, TbLoader2 } from 'react-icons/tb';

const ALLOWED_ROLES = ['admin', 'super_admin', 'seller'];

const SUPER_ADMIN_PREFIXES = [
  '/admin/products',
  '/admin/categories',
  '/admin/brands',
  '/admin/settings/company',
  '/admin/settings/users',
];

const SELLER_FORBIDDEN_PREFIXES = [
  '/admin/inventory',
  '/admin/purchases',
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
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center gap-0.5">
        <TbLoader2 className="w-8 h-8 text-[#00a650] animate-spin" />
        <h2 className="text-sm font-semibold text-gray-800">Verificando permisos</h2>
      </div>
    );
  }

  // Si no tiene ningún rol de staff o está inactivo
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3.5">
            <TbShieldLock size={26} />
          </div>
          <h2 className="text-base font-semibold text-gray-800">Acceso Denegado</h2>
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
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-200 flex flex-col items-center max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3.5">
            <TbShieldLock size={26} />
          </div>
          <h2 className="text-base font-semibold text-gray-800">Acceso Restringido</h2>
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


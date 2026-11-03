'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  TbArrowLeft,
  TbUser, 
  TbMail, 
  TbPhone, 
  TbLoader2,
  TbCrown,
  TbBuilding,
  TbShoppingCart,
  TbUsers,
  TbCheck
} from 'react-icons/tb';
import { UserRole, CreateUserDto } from '@/types/user.types';
import { useUserStore } from '@/stores/user.store';

const ROLES_INFO: {
  role: UserRole;
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
}[] = [
  {
    role: 'super_admin',
    title: 'Super Admin',
    badge: 'Total',
    description: 'Acceso total y configuración',
    icon: TbCrown,
    colorClass: 'border-amber-400 bg-amber-50/70 text-amber-900 ring-1 ring-amber-400/30',
  },
  {
    role: 'admin',
    title: 'Administrador',
    badge: 'Gestión',
    description: 'Control y administración general',
    icon: TbBuilding,
    colorClass: 'border-blue-400 bg-blue-50/70 text-blue-900 ring-1 ring-blue-400/30',
  },
  {
    role: 'seller',
    title: 'Vendedor',
    badge: 'Operativo',
    description: 'Atención, caja y ventas',
    icon: TbShoppingCart,
    colorClass: 'border-purple-400 bg-purple-50/70 text-purple-900 ring-1 ring-purple-400/30',
  },
  {
    role: 'client',
    title: 'Cliente',
    badge: 'Tienda',
    description: 'Comprador e-commerce',
    icon: TbUsers,
    colorClass: 'border-gray-300 bg-gray-50 text-gray-800 ring-1 ring-gray-400/30',
  },
];

export function UserCreateForm() {
  const router = useRouter();
  const { addUser } = useUserStore();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('seller');
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage('El correo electrónico es obligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload: CreateUserDto = {
        email: email.trim().toLowerCase(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        role,
        isActive,
      };

      await addUser(payload);
      router.push('/admin/settings/users');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar usuario';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl pb-16">
      {/* Volver */}
      <div>
        <Link
          href="/admin/settings/users"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#3483fa] transition-colors cursor-pointer group"
        >
          <TbArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          <span>Volver a Usuarios y Roles</span>
        </Link>
      </div>

      {/* Cabecera de la Página */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-gray-200/80">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Registrar Nuevo Colaborador
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Crea la cuenta de acceso y asigna los permisos operativos o de gerencia en el sistema.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm animate-in fade-in duration-200">
            {errorMessage}
          </div>
        )}

        {/* Sección 1: Datos Personales y Acceso */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-[11px] text-gray-400">
            1. Datos de Contacto y Acceso
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Correo */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Correo Electrónico <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <TbMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colaborador@tuempresa.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-[#3483fa] focus:ring-2 focus:ring-[#3483fa]/20 outline-none transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                El colaborador usará este correo para iniciar sesión en la plataforma con Clerk / Google.
              </p>
            </div>

            {/* Nombres */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nombres
              </label>
              <div className="relative">
                <TbUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej: Carlos Alberto"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-[#3483fa] focus:ring-2 focus:ring-[#3483fa]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Apellidos */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Apellidos
              </label>
              <div className="relative">
                <TbUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej: Mendoza Ramos"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-[#3483fa] focus:ring-2 focus:ring-[#3483fa]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <TbPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: +51 987 654 321"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-[#3483fa] focus:ring-2 focus:ring-[#3483fa]/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2: Rol y Nivel de Acceso */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-[11px] text-gray-400">
              2. Rol y Nivel de Acceso
            </h2>
            <span className="text-xs text-gray-400 font-medium">Selecciona un nivel</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {ROLES_INFO.map((item) => {
              const Icon = item.icon;
              const isSelected = role === item.role;
              return (
                <div
                  key={item.role}
                  onClick={() => setRole(item.role)}
                  className={`px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? item.colorClass + ' shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/90 shadow-2xs' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs truncate block leading-tight">{item.title}</span>
                      <p className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <TbCheck size={11} />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sección 3: Estado Inicial */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5 sm:p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#3483fa] focus:ring-[#3483fa] border-gray-300"
            />
            <div>
              <span className="text-xs sm:text-sm font-bold text-gray-800 block">
                Habilitar usuario inmediatamente
              </span>
              <span className="text-xs text-gray-500 block">
                Permite que el usuario pueda iniciar sesión una vez se complete el registro.
              </span>
            </div>
          </label>
        </div>

        {/* Botones de Envío */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Link
            href="/admin/settings/users"
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#3483fa] hover:bg-blue-600 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <TbLoader2 className="animate-spin" size={17} />
                <span>Guardando...</span>
              </>
            ) : (
              <span>Guardar Colaborador</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { 
  TbX, 
  TbUser, 
  TbMail, 
  TbPhone, 
  TbShield, 
  TbLoader2,
  TbCrown,
  TbBuilding,
  TbShoppingCart,
  TbUsers,
  TbCheck
} from 'react-icons/tb';
import { User, UserRole, UpdateUserDto } from '@/types/user.types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: UpdateUserDto) => Promise<void>;
  initialData?: User | null;
}

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

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: UserFormModalProps) {
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('seller');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setPhone(initialData.phone || '');
      setRole(initialData.role || 'client');
    }
    setErrorMessage(null);
  }, [initialData, isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !initialData) return null;

  const fullName = [initialData.firstName, initialData.lastName].filter(Boolean).join(' ') || 'Usuario sin nombre';
  const initials = (initialData.firstName?.[0] || initialData.email[0] || 'U').toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload: UpdateUserDto = {
        phone: phone.trim() || undefined,
        role,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar cambios';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-brand/30 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand text-gray-900 flex items-center justify-center shadow-xs">
              <TbShield size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">
                Asignar Rol y Permisos
              </h3>
              <p className="text-xs text-gray-500">
                Define el nivel de acceso operativo o de gerencia para este usuario
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <TbX size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Tarjeta Informativa del Usuario Sincronizado */}
          <div className="p-3 bg-gray-50 border border-gray-200/80 rounded-xl flex items-center gap-3">
            {initialData.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={initialData.imageUrl}
                alt={fullName}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#3483fa] font-bold text-sm flex items-center justify-center shrink-0 border border-blue-200">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">
                {fullName}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                <TbMail size={13} className="text-gray-400" />
                <span className="truncate">{initialData.email}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 shrink-0">
              {initialData.role}
            </span>
          </div>

          {/* Selector de Rol */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Selecciona el Rol / Nivel de Acceso <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {ROLES_INFO.map((item) => {
                const Icon = item.icon;
                const isSelected = role === item.role;
                return (
                  <div
                    key={item.role}
                    onClick={() => setRole(item.role)}
                    className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? item.colorClass + ' shadow-2xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/90 shadow-2xs' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 leading-tight">
                          <span className="font-bold text-xs truncate">{item.title}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <TbCheck size={10} />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Teléfono de Contacto (Opcional)
            </label>
            <div className="relative">
              <TbPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: +51 987 654 321"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 focus:border-[#3483fa] focus:ring-2 focus:ring-[#3483fa]/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#3483fa] hover:bg-blue-600 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <TbLoader2 className="animate-spin" size={15} />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Actualizar Permisos</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

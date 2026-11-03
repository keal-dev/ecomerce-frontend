'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TbX, 
  TbHome, 
  TbCategory, 
  TbTag, 
  TbHistory, 
  TbShirt, 
  TbBuildingStore, 
  TbHelp, 
  TbPackage, 
  TbHeart, 
  TbBell, 
  TbChevronDown, 
  TbChevronRight,
  TbUserCircle,
  TbDeviceLaptop, 
  TbToolsKitchen2, 
  TbArmchair, 
  TbBarbell, 
  TbTools, 
  TbCar, 
  TbShoppingCart, 
  TbHorseToy,
  TbDeviceMobile,
  TbDeviceGamepad2,
  TbDeviceTv,
  TbShoe
} from 'react-icons/tb';
import { useCategoryStore } from '@/stores/category.store';
import { useAuthStore } from '@/stores/auth.store';
import { useCompanyStore } from '@/stores/company.store';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';

const iconMap: Record<string, React.ElementType> = {
  TbDeviceLaptop,
  TbToolsKitchen2,
  TbArmchair,
  TbShirt,
  TbShoe,
  TbBarbell,
  TbTools,
  TbCar,
  TbShoppingCart,
  TbHorseToy,
  TbDeviceMobile,
  TbDeviceGamepad2,
  TbDeviceTv,
  TbCategory
};

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenuDrawer = ({ isOpen, onClose }: MobileMenuDrawerProps) => {
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const { categories, isLoading, fetchCategories } = useCategoryStore();
  const { currentUser } = useAuthStore();
  const { company } = useCompanyStore();

  const canAccessSalesPanel = Boolean(
    currentUser && ['admin', 'super_admin', 'seller'].includes(currentUser.role)
  );

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, fetchCategories]);

  // Cierra el drawer con la tecla Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
      {/* Backdrop oscuro */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel lateral deslizante */}
      <div className="relative w-[320px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-50 overflow-hidden transform transition-transform duration-300 ease-out">
        
        {/* Cabecera del Menú Móvil (Estilo Mercado Libre) */}
        <div 
          className="p-4 flex items-center justify-between border-b border-black/10 bg-brand transition-colors duration-300"
        >
          <div className="flex items-center gap-3">
            <Show when="signed-in">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10 ring-2 ring-white/80"
                  }
                }}
              />
              <div className="flex flex-col">
                <span className="text-xs text-gray-700">Bienvenido</span>
                <span className="text-sm font-semibold text-[#333]">Mi Cuenta</span>
              </div>
            </Show>

            <Show when="signed-out">
              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-gray-700">
                <TbUserCircle size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-700 leading-tight">Bienvenido</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <SignInButton mode="modal">
                    <button 
                      type="button" 
                      onClick={onClose} 
                      className="text-xs font-semibold text-[#3483fa] hover:underline cursor-pointer"
                    >
                      Ingresa
                    </button>
                  </SignInButton>
                  <span className="text-gray-400 text-xs">•</span>
                  <SignUpButton mode="modal">
                    <button 
                      type="button" 
                      onClick={onClose} 
                      className="text-xs font-semibold text-gray-800 hover:underline cursor-pointer"
                    >
                      Regístrate
                    </button>
                  </SignUpButton>
                </div>
              </div>
            </Show>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 text-gray-800 transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <TbX size={22} />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 text-[14px] text-[#333]">
          
          {/* Navegación Principal */}
          <div className="py-2">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-3.5 px-5 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors"
            >
              <TbHome size={20} className="text-gray-500" />
              <span>Inicio</span>
            </Link>

            <Link
              href="/ofertas"
              onClick={onClose}
              className="flex items-center gap-3.5 px-5 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors"
            >
              <TbTag size={20} className="text-gray-500" />
              <span>Ofertas</span>
            </Link>

            <Link
              href="/historial"
              onClick={onClose}
              className="flex items-center gap-3.5 px-5 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors"
            >
              <TbHistory size={20} className="text-gray-500" />
              <span>Historial</span>
            </Link>

            <Link
              href="/favoritos"
              onClick={onClose}
              className="flex items-center gap-3.5 px-5 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors"
            >
              <TbHeart size={20} className="text-gray-500" />
              <span>Favoritos</span>
            </Link>


            <Link
              href="/vender"
              onClick={onClose}
              className="flex items-center gap-3.5 px-5 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors"
            >
              <TbBuildingStore size={20} className="text-gray-500" />
              <span>Vender</span>
            </Link>

            <Link
              href="/ayuda"
              onClick={onClose}
              className="flex items-center gap-3.5 px-5 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors"
            >
              <TbHelp size={20} className="text-gray-500" />
              <span>Ayuda</span>
            </Link>
          </div>

          {/* Acordeón de Categorías de la Base de Datos */}
          <div className="py-2">
            <button
              type="button"
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 text-left font-medium text-gray-900 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <TbCategory size={20} className="text-[#3483fa]" />
                <span>Categorías</span>
              </div>
              <TbChevronDown 
                size={18} 
                className={`text-gray-400 transition-transform duration-200 ${
                  isCategoriesExpanded ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {isCategoriesExpanded && (
              <div className="bg-gray-50/70 border-y border-gray-100 py-1 pl-12 pr-4 space-y-1">
                {isLoading && categories.length === 0 ? (
                  <div className="py-4 flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-4 h-4 border-2 border-[#3483fa] border-t-transparent rounded-full animate-spin" />
                    <span>Cargando categorías...</span>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="py-3 text-xs text-gray-500">
                    No hay categorías disponibles
                  </div>
                ) : (
                  categories.map((cat) => {
                    const IconComponent = (cat.icon && iconMap[cat.icon]) ? iconMap[cat.icon] : TbCategory;

                    return (
                      <Link
                        key={cat.id}
                        href={cat.href || `/category/${cat.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between py-2 text-[13px] text-gray-700 hover:text-[#3483fa] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('data:')) ? (
                            <img 
                              src={cat.icon} 
                              alt={cat.name} 
                              className="w-4 h-4 object-contain shrink-0" 
                            />
                          ) : (
                            <IconComponent size={16} className="text-gray-400 shrink-0" />
                          )}
                          <span className="truncate">{cat.name}</span>
                        </div>
                        {cat.badge && (
                          <span className="bg-[#00a650] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                            {cat.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })
                )}

                <div className="pt-2 pb-1">
                  <Link
                    href="/categories"
                    onClick={onClose}
                    className="text-xs font-semibold text-[#3483fa] hover:underline flex items-center gap-1"
                  >
                    Ver todas las categorías <TbChevronRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Enlaces de Usuario / Transaccionales */}
          <div className="py-2">
            <Link
              href="#"
              onClick={onClose}
              className="flex items-center gap-3.5 px-5 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors"
            >
              <TbPackage size={20} className="text-gray-500" />
              <span>Mis compras</span>
            </Link>

            <Link
              href="/favoritos"
              onClick={onClose}
              className="flex items-center gap-3.5 px-5 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors"
            >
              <TbHeart size={20} className="text-gray-500" />
              <span>Favoritos</span>
            </Link>

            <Link
              href="#"
              onClick={onClose}
              className="flex items-center gap-3.5 px-5 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors"
            >
              <TbBell size={20} className="text-gray-500" />
              <span>Notificaciones</span>
            </Link>

            <Show when="signed-in">
              {canAccessSalesPanel && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center gap-3.5 px-5 py-2.5 hover:bg-gray-50 text-gray-800 font-medium transition-colors"
                >
                  <TbBuildingStore size={20} className="text-emerald-600" />
                  <span className="text-emerald-700">Panel de administración</span>
                </Link>
              )}
            </Show>
          </div>

        </div>

        {/* Footer del Menú */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-400 text-center">
          MercadoFalso &copy; {new Date().getFullYear()}
        </div>

      </div>
    </div>
  );
};

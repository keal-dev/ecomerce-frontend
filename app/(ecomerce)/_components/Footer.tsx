'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  TbCreditCard, 
  TbTruckDelivery, 
  TbShieldCheck, 
  TbHeadset, 
  TbChevronRight, 
  TbMail,
  TbBrandTiktok 
} from 'react-icons/tb';
import { 
  FaInstagram, 
  FaFacebookF, 
  FaXTwitter, 
  FaYoutube 
} from 'react-icons/fa6';
import { useCompanyStore } from '@/stores/company.store';

export const Footer = () => {
  const { company, fetchCompany } = useCompanyStore();

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  return (
    <footer className="bg-white border-t border-gray-200 text-[#333]">
      {/* 1. Value Proposition Banner */}
      <div className="border-b border-gray-100 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 md:px-7 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white transition-colors">
              <div className="p-3 bg-brand/30 text-gray-800 rounded-full flex-shrink-0">
                <TbCreditCard size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-900">Paga con seguridad</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Tarjetas de crédito, débito o efectivo con total protección.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white transition-colors">
              <div className="p-3 bg-brand/30 text-gray-800 rounded-full flex-shrink-0">
                <TbTruckDelivery size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-900">Envíos a todo el país</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Rastreo en tiempo real y entregas rápidas hasta tu puerta.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white transition-colors">
              <div className="p-3 bg-brand/30 text-gray-800 rounded-full flex-shrink-0">
                <TbShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-900">Compra 100% Protegida</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  ¿No era lo que esperabas? Te devolvemos el dinero sin vueltas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white transition-colors">
              <div className="p-3 bg-brand/30 text-gray-800 rounded-full flex-shrink-0">
                <TbHeadset size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-900">Atención personalizada</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Soporte continuo ante cualquier consulta sobre tus compras.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 md:px-7 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-2 pr-0 lg:pr-8">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              {company?.logoUrl && (
                <div className="h-8 flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={company.logoUrl} 
                    alt={company.name || 'Logo'} 
                    className="h-full w-auto max-w-[45px] object-contain" 
                  />
                </div>
              )}
              <span className="text-[#333] font-bold text-2xl tracking-tighter">
                {company?.name || 'Mercado Libre'}
              </span>
            </Link>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              {company?.slogan || 'Tu tienda online de confianza. Miles de productos con las mejores ofertas, envíos rápidos y garantía asegurada en cada compra.'}
            </p>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-gray-900 block">
                Suscríbete para recibir ofertas y cupones exclusivos
              </span>
              <div className="flex max-w-md">
                <div className="relative flex-1">
                  <TbMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="email" 
                    placeholder="Ingresa tu correo electrónico" 
                    className="w-full bg-gray-50 border border-gray-300 rounded-l-md py-2 pl-9 pr-3 text-xs outline-none focus:border-[#3483fa] focus:bg-white transition-all"
                  />
                </div>
                <button 
                  type="button" 
                  className="bg-[#3483fa] hover:bg-blue-600 text-white font-medium text-xs px-4 rounded-r-md transition-colors flex items-center gap-1"
                >
                  Unirme <TbChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Links Column 1: Acerca de */}
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Acerca de
            </h5>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Quiénes somos</Link></li>
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Términos y condiciones</Link></li>
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Políticas de privacidad</Link></li>
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Trabaja con nosotros</Link></li>
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Sustentabilidad</Link></li>
            </ul>
          </div>

          {/* Links Column 2: Ayuda y Soporte */}
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Ayuda y Compras
            </h5>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li><Link href="/ayuda" className="hover:text-[#3483fa] transition-colors">Centro de ayuda</Link></li>
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Rastrea tu pedido</Link></li>
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Cómo comprar</Link></li>
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Costos y tiempos de envío</Link></li>
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Devoluciones y reembolsos</Link></li>
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Botón de arrepentimiento</Link></li>
            </ul>
          </div>

          {/* Links Column 3: Categorías */}
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Categorías
            </h5>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Tecnología y Celulares</Link></li>
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Hogar y Muebles</Link></li>
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Moda y Calzado</Link></li>
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Supermercado</Link></li>
              <li><Link href="#" className="hover:text-[#3483fa] transition-colors">Ofertas del día</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Socials */}
      <div className="border-t border-gray-100 bg-gray-50 py-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 md:px-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            Copyright © {new Date().getFullYear()} {company?.legalName || company?.name || 'Mercado Libre'}. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-4 text-gray-600">
            {company?.facebookUrl ? (
              <a href={company.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-[#3483fa] transition-colors">
                <FaFacebookF size={16} />
              </a>
            ) : null}
            {company?.instagramUrl ? (
              <a href={company.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-[#3483fa] transition-colors">
                <FaInstagram size={17} />
              </a>
            ) : null}
            {company?.tiktokUrl ? (
              <a href={company.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-[#3483fa] transition-colors">
                <TbBrandTiktok size={18} />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
};

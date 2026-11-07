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
  TbBrandTiktok,
  TbPhone,
  TbMapPin,
  TbBook,
} from 'react-icons/tb';
import { 
  FaInstagram, 
  FaFacebookF, 
  FaXTwitter, 
  FaYoutube 
} from 'react-icons/fa6';
import { useCompanyStore } from '@/stores/company.store';

/**
 * Valida y normaliza URLs de redes sociales.
 * Retorna la URL con protocolo (https://) si apunta a un perfil real del negocio,
 * o null si está vacía, es genérica (ej. solo instagram.com sin usuario) o inválida.
 * Permite tanto URLs completas como arrobas (@usuario).
 */
function getValidSocialProfileUrl(url: string | null | undefined, platform: 'facebook' | 'instagram' | 'tiktok'): string | null {
  if (!url) return null;
  let trimmed = url.trim();
  if (!trimmed || trimmed === '#' || trimmed.startsWith('javascript:')) return null;

  // Corregir errores tipográficos comunes como "https.instagram.com"
  trimmed = trimmed.replace(/^https?\./i, 'https://');

  // Si el usuario colocó solo el nombre o @nombre (ej: "@mitienda" o "mitienda")
  if (!trimmed.includes('.')) {
    const username = trimmed.replace(/^@/, '').trim();
    if (!username) return null;
    if (platform === 'facebook') return `https://facebook.com/${username}`;
    if (platform === 'instagram') return `https://instagram.com/${username}`;
    if (platform === 'tiktok') return `https://tiktok.com/@${username}`;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname.toLowerCase().includes(platform)) return null;

    // Verificar que tenga una ruta de perfil real (ej: /tu_cuenta) y no solo la raíz
    const path = parsed.pathname.replace(/\/+$/, '').trim();
    if (!path || path === '' || path === '/') {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export const Footer = () => {
  const { company, fetchCompany } = useCompanyStore();

  useEffect(() => {
    fetchCompany(true);
  }, [fetchCompany]);

  const validFacebook = getValidSocialProfileUrl(company?.facebookUrl, 'facebook');
  const validInstagram = getValidSocialProfileUrl(company?.instagramUrl, 'instagram');
  const validTiktok = getValidSocialProfileUrl(company?.tiktokUrl, 'tiktok');

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

            {/* Información de Contacto Directa (Requisito de Pasarelas / Ley de Protección al Consumidor) */}
            <div className="mt-6 pt-5 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <span className="font-semibold text-gray-900 block text-xs uppercase tracking-wider mb-2">
                Atención y Contacto
              </span>

              <div className="flex items-center gap-2">
                <TbPhone size={15} className="text-[#3483fa] shrink-0" />
                <span className="text-gray-500 font-medium">Teléfono / WhatsApp:</span>
                <a
                  href={`tel:${(company?.phone || '+51 999 888 777').replace(/[^0-9+]/g, '')}`}
                  className="font-semibold text-gray-800 hover:text-[#3483fa] transition-colors"
                >
                  {company?.phone || '+51 999 888 777'}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <TbMail size={15} className="text-[#3483fa] shrink-0" />
                <span className="text-gray-500 font-medium">Correo:</span>
                <a
                  href={`mailto:${company?.email || 'soporte@mitienda.com'}`}
                  className="font-semibold text-gray-800 hover:text-[#3483fa] transition-colors"
                >
                  {company?.email || 'soporte@mitienda.com'}
                </a>
              </div>

              <div className="flex items-start gap-2">
                <TbMapPin size={15} className="text-[#3483fa] shrink-0 mt-0.5" />
                <span className="text-gray-500 font-medium">Dirección:</span>
                <span className="font-medium text-gray-800">
                  {company?.address || 'Lima, Perú'}
                </span>
              </div>

              {(validInstagram || validFacebook || validTiktok) && (
                <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
                  <span className="text-gray-500 font-medium">Síguenos:</span>
                  <div className="flex items-center gap-3 text-gray-700">
                    {validInstagram && (
                      <a
                        href={validInstagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram Oficial"
                        className="flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-semibold transition-colors"
                      >
                        <FaInstagram size={15} />
                        <span>Instagram</span>
                      </a>
                    )}
                    {validFacebook && (
                      <a
                        href={validFacebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook Oficial"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                      >
                        <FaFacebookF size={14} />
                        <span>Facebook</span>
                      </a>
                    )}
                    {validTiktok && (
                      <a
                        href={validTiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="TikTok Oficial"
                        className="flex items-center gap-1.5 text-xs text-gray-900 hover:text-black font-semibold transition-colors"
                      >
                        <TbBrandTiktok size={15} />
                        <span>TikTok</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Links Column 1: Acerca de */}
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Acerca de
            </h5>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li><Link href="/ayuda" className="hover:text-[#3483fa] transition-colors">Quiénes somos</Link></li>
              <li><Link href="/terminos-y-condiciones" className="hover:text-[#3483fa] transition-colors font-medium text-gray-800">Términos y condiciones</Link></li>
              <li><Link href="/privacidad" className="hover:text-[#3483fa] transition-colors">Políticas de privacidad</Link></li>
              <li><Link href="/ayuda" className="hover:text-[#3483fa] transition-colors">Trabaja con nosotros</Link></li>
              <li><Link href="/ayuda" className="hover:text-[#3483fa] transition-colors">Sustentabilidad</Link></li>
            </ul>
          </div>

          {/* Links Column 2: Ayuda y Compras */}
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Ayuda y Compras
            </h5>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li><Link href="/ayuda" className="hover:text-[#3483fa] transition-colors">Centro de ayuda</Link></li>
              <li><Link href="/ayuda" className="hover:text-[#3483fa] transition-colors">Rastrea tu pedido</Link></li>
              <li><Link href="/ayuda" className="hover:text-[#3483fa] transition-colors">Cómo comprar</Link></li>
              <li><Link href="/ayuda" className="hover:text-[#3483fa] transition-colors">Costos y tiempos de envío</Link></li>
              <li><Link href="/devoluciones" className="hover:text-[#3483fa] transition-colors font-medium text-gray-800">Devoluciones y reembolsos</Link></li>
              <li><Link href="/devoluciones" className="hover:text-[#3483fa] transition-colors">Botón de arrepentimiento</Link></li>
              <li>
                <Link 
                  href="/libro-de-reclamaciones" 
                  className="hover:text-[#3483fa] transition-colors font-bold text-gray-900 flex items-center gap-1.5 pt-1"
                >
                  <TbBook size={14} className="text-[#3483fa]" />
                  <span>Libro de Reclamaciones</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Categorías */}
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Categorías
            </h5>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li><Link href="/categories" className="hover:text-[#3483fa] transition-colors">Tecnología y Celulares</Link></li>
              <li><Link href="/categories" className="hover:text-[#3483fa] transition-colors">Hogar y Muebles</Link></li>
              <li><Link href="/categories" className="hover:text-[#3483fa] transition-colors">Moda y Calzado</Link></li>
              <li><Link href="/categories" className="hover:text-[#3483fa] transition-colors">Supermercado</Link></li>
              <li><Link href="/ofertas" className="hover:text-[#3483fa] transition-colors">Ofertas del día</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Socials */}
      <div className="border-t border-gray-100 bg-gray-50 py-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 md:px-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <p>
              Copyright © {new Date().getFullYear()} {company?.legalName || company?.name || 'Mercado Libre'}. Todos los derechos reservados.
            </p>
            <p className="text-[11px] text-gray-400">
              <span>{company?.legalName || 'Empresa Principal S.A.C.'}</span>
              {company?.taxId ? <span> • RUC: {company.taxId}</span> : null}
            </p>
          </div>

          {/* Badge Oficial INDECOPI Libro de Reclamaciones Virtual */}
          <Link
            href="/libro-de-reclamaciones"
            className="flex items-center gap-2.5 px-3.5 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-2xs hover:shadow-xs transition-all group shrink-0"
            title="Libro de Reclamaciones Virtual conforme a las disposiciones de INDECOPI (Ley N° 29571)"
          >
            <div className="w-8 h-8 rounded-lg bg-brand/30 text-gray-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <TbBook size={18} />
            </div>
            <div className="text-left">
              <span className="font-bold text-gray-900 text-[11px] block leading-none tracking-tight">
                Libro de Reclamaciones
              </span>
              <span className="text-[9px] text-gray-400 block leading-none mt-1">
                Virtual • INDECOPI
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-gray-600">
            {validFacebook && (
              <a
                href={validFacebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Oficial"
                className="hover:text-[#3483fa] transition-colors"
              >
                <FaFacebookF size={16} />
              </a>
            )}
            {validInstagram && (
              <a
                href={validInstagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Oficial"
                className="hover:text-[#3483fa] transition-colors"
              >
                <FaInstagram size={17} />
              </a>
            )}
            {validTiktok && (
              <a
                href={validTiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Oficial"
                className="hover:text-[#3483fa] transition-colors"
              >
                <TbBrandTiktok size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

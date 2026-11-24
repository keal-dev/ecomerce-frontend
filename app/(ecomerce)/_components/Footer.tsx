'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TbCreditCard, 
  TbTruckDelivery, 
  TbShieldCheck, 
  TbHeadset, 
  TbChevronRight, 
  TbMail,
  TbBrandTiktok,
  TbBrandWhatsapp,
  TbPhone,
  TbMapPin,
  TbBook,
  TbCheck,
  TbReceiptTax,
  TbShieldLock,
  TbLock,
} from 'react-icons/tb';
import { 
  FaInstagram, 
  FaFacebookF, 
} from 'react-icons/fa6';
import { useCompanyStore } from '@/stores/company.store';
import { useCategoryStore } from '@/stores/category.store';

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
  const { categories, fetchCategories } = useCategoryStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    fetchCompany(true);
    fetchCategories();
  }, [fetchCompany, fetchCategories]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  const validFacebook = getValidSocialProfileUrl(company?.facebookUrl, 'facebook');
  const validInstagram = getValidSocialProfileUrl(company?.instagramUrl, 'instagram');
  const validTiktok = getValidSocialProfileUrl(company?.tiktokUrl, 'tiktok');

  const brandName = company?.name || 'Tienda Oficial';
  const rawPhone = company?.phone || '+51 999 888 777';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300">
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

      {/* 2. Main Footer Navigation & Brand Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-7 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Col 1 & 2: Identidad, Newsletter y Contacto Directo */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 group">
                {company?.logoUrl ? (
                  <div className="h-9 flex items-center justify-center overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={company.logoUrl} 
                      alt={brandName} 
                      className="h-full w-auto max-w-[50px] object-contain drop-shadow" 
                    />
                  </div>
                ) : null}
                <span className="text-white font-extrabold text-2xl tracking-tight">
                  {brandName}
                </span>
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed mt-2.5 max-w-sm">
                {company?.slogan || 'Tu plataforma de compras en línea de confianza. Catálogo certificado con las mejores ofertas, entregas rápidas y garantía total.'}
              </p>
            </div>

            {/* Newsletter Dark Sleek */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 max-w-md">
              <span className="text-xs font-semibold text-white block mb-1">
                Boletín de novedades y ofertas
              </span>
              <p className="text-[11px] text-slate-400 mb-3">
                Entérate antes que nadie de lanzamientos, promociones y cupones de descuento.
              </p>

              {newsletterSubscribed ? (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-950/60 border border-emerald-700/60 rounded-lg text-xs text-emerald-300">
                  <TbCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>¡Gracias por suscribirte! Recibirás nuestras novedades en tu correo.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex">
                  <div className="relative flex-1">
                    <TbMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Ingresa tu correo electrónico" 
                      className="w-full bg-slate-900 border border-slate-700 rounded-l-lg py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 rounded-r-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Unirme <TbChevronRight size={14} />
                  </button>
                </form>
              )}
              <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-400">
                <TbLock size={12} className="text-slate-400 shrink-0" />
                <span>No enviamos spam. Puedes cancelar tu suscripción en cualquier momento.</span>
              </div>
            </div>

            {/* Canales de Contacto Directo */}
            <div className="space-y-2.5 text-xs">
              <span className="font-semibold text-white text-xs uppercase tracking-wider block">
                Atención y Contacto
              </span>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                  <TbBrandWhatsapp size={14} />
                </div>
                <span className="text-slate-400 font-medium">WhatsApp / Teléfono:</span>
                <a
                  href={`tel:${cleanPhone}`}
                  className="font-medium text-slate-200 hover:text-white transition-colors"
                >
                  {rawPhone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                  <TbMail size={14} />
                </div>
                <span className="text-slate-400 font-medium">Correo Electrónico:</span>
                <a
                  href={`mailto:${company?.email || 'soporte@mitienda.com'}`}
                  className="font-medium text-slate-200 hover:text-white transition-colors"
                >
                  {company?.email || 'soporte@mitienda.com'}
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <TbMapPin size={14} />
                </div>
                <span className="text-slate-400 font-medium">Ubicación:</span>
                <span className="font-medium text-slate-200">
                  {company?.address || 'Lima, Perú'}
                </span>
              </div>
            </div>

          </div>

          {/* Col 3: Empresa y Legal */}
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-white mb-4">
              Nuestra Empresa
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/ayuda" className="hover:text-white transition-colors">
                  Quiénes somos
                </Link>
              </li>
              <li>
                <Link href="/terminos-y-condiciones" className="hover:text-white transition-colors font-medium text-slate-300">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-white transition-colors">
                  Políticas de privacidad
                </Link>
              </li>
              <li>
                <Link href="/ayuda" className="hover:text-white transition-colors">
                  Trabaja con nosotros
                </Link>
              </li>
              <li>
                <Link href="/ayuda" className="hover:text-white transition-colors">
                  Sostenibilidad y compromiso
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Ayuda al Cliente */}
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-white mb-4">
              Servicio al Cliente
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/ayuda" className="hover:text-white transition-colors">
                  Centro de ayuda
                </Link>
              </li>
              <li>
                <Link href="/rastreo" className="hover:text-white transition-colors font-medium text-slate-300">
                  Rastrea tu pedido
                </Link>
              </li>
              <li>
                <Link href="/ayuda" className="hover:text-white transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href="/ayuda" className="hover:text-white transition-colors">
                  Costos y tiempos de entrega
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="hover:text-white transition-colors font-medium text-slate-300">
                  Devoluciones y reembolsos
                </Link>
              </li>
              <li>
                <Link 
                  href="/libro-de-reclamaciones" 
                  className="hover:text-white transition-colors font-bold text-slate-200 flex items-center gap-1.5 pt-1"
                >
                  <TbBook size={14} className="text-blue-400" />
                  <span>Libro de Reclamaciones</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Categorías & Enlaces Rápidos */}
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-white mb-4">
              Categorías
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={cat.href || `/category/${cat.id}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/categories" className="hover:text-white font-medium text-slate-300 transition-colors">
                  Ver todas las categorías
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="hover:text-white transition-colors text-amber-400 font-medium">
                  Ofertas especiales
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. Strip de Confianza, Métodos de Pago y Certificaciones SUNAT */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 py-5">
        <div className="max-w-7xl mx-auto px-4 md:px-7 flex flex-col lg:flex-row items-center justify-between gap-5 text-xs text-slate-400">
          
          {/* Métodos de Pago */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="text-[11px] font-semibold text-slate-300 mr-1 uppercase tracking-wider">
              Métodos de Pago:
            </span>
            {['Visa', 'Mastercard', 'Amex', 'Yape', 'Plin', 'PagoEfectivo', 'Transferencia'].map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-[11px] font-medium text-slate-300 shadow-2xs"
              >
                {method}
              </span>
            ))}
          </div>

          {/* Garantías y Certificación */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <TbReceiptTax size={15} className="text-emerald-400" />
              <span>Boleta y Factura Electrónica SUNAT</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <TbShieldLock size={15} className="text-blue-400" />
              <span>Cifrado SSL 256 bits Seguro</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Sub-footer Legal, Libro INDECOPI y Redes Sociales */}
      <div className="bg-slate-950 border-t border-slate-900 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 md:px-7 flex flex-col md:flex-row items-center justify-between gap-5">
          
          {/* Copyright y RUC */}
          <div className="text-center md:text-left space-y-1">
            <p className="text-slate-400">
              Copyright © {new Date().getFullYear()} <span className="text-slate-200 font-medium">{company?.legalName || brandName}</span>. Todos los derechos reservados.
            </p>
            <p className="text-[11px] text-slate-400">
              <span>{company?.legalName || 'Empresa de Comercio Electrónico S.A.C.'}</span>
              {company?.taxId ? <span> • RUC: {company.taxId}</span> : null}
            </p>
          </div>

          {/* Badge Oficial INDECOPI Libro de Reclamaciones */}
          <Link
            href="/libro-de-reclamaciones"
            className="flex items-center gap-3 px-3.5 py-2 bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 rounded-xl transition-all group shrink-0"
            title="Libro de Reclamaciones Virtual conforme a las disposiciones de INDECOPI (Ley N° 29571)"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <TbBook size={18} />
            </div>
            <div className="text-left">
              <span className="font-bold text-slate-200 group-hover:text-white text-[11px] block leading-none tracking-tight">
                Libro de Reclamaciones
              </span>
              <span className="text-[10px] text-slate-400 block leading-none mt-1">
                Virtual • INDECOPI
              </span>
            </div>
          </Link>

          {/* Redes Sociales */}
          <div className="flex items-center gap-2.5">
            {validFacebook && (
              <a
                href={validFacebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Oficial"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition-all duration-200"
              >
                <FaFacebookF size={13} />
              </a>
            )}
            {validInstagram && (
              <a
                href={validInstagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Oficial"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-pink-600 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition-all duration-200"
              >
                <FaInstagram size={14} />
              </a>
            )}
            {validTiktok && (
              <a
                href={validTiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Oficial"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-black text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition-all duration-200"
              >
                <TbBrandTiktok size={15} />
              </a>
            )}
          </div>

        </div>
      </div>
    </footer>
  );
};

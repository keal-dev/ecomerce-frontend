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
  TbMapPin,
  TbBook,
  TbCheck,
  TbReceiptTax,
  TbShieldLock,
  TbLock,
} from 'react-icons/tb';
import { FaInstagram, FaFacebookF } from 'react-icons/fa6';
import { useCompanyStore } from '@/stores/company.store';
import { useCategoryStore } from '@/stores/category.store';

function getValidSocialProfileUrl(
  url: string | null | undefined,
  platform: 'facebook' | 'instagram' | 'tiktok',
): string | null {
  if (!url) return null;
  let trimmed = url.trim();
  if (!trimmed || trimmed === '#' || trimmed.startsWith('javascript:')) return null;

  trimmed = trimmed.replace(/^https?\./i, 'https://');

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
    const path = parsed.pathname.replace(/\/+$/, '').trim();
    if (!path || path === '' || path === '/') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

const DELIVERY_ZONES = [
  'Miraflores',
  'San Isidro',
  'San Borja',
  'Surco',
  'Barranco',
  'La Molina',
  'Lince',
  'San Miguel',
  'Magdalena',
  'Pueblo Libre',
  'Jesús María',
  'Lima Centro',
  'Chorrillos',
  'Surquillo',
  'Envíos a todo el Perú',
];

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

  const brandName = company?.name || 'Cooperativa Gourmet';
  const rawPhone = company?.phone || '+51 999 888 777';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');

  return (
    <footer className="bg-black border-t border-[#262626] text-neutral-300">
      {/* 1. Value Proposition Banner */}
      <div className="border-b border-[#262626] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 md:px-7 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5 p-2">
              <div className="w-11 h-11 bg-[#141414] border border-[#262626] text-[#de2a2a] flex items-center justify-center shrink-0">
                <TbTruckDelivery size={22} />
              </div>
              <div>
                <h4 className="font-display font-extrabold uppercase text-xs tracking-wider text-white">
                  Delivery Express
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Entregas rápidas en Lima Metropolitana y envíos seguros a todo el Perú.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-2">
              <div className="w-11 h-11 bg-[#141414] border border-[#262626] text-[#de2a2a] flex items-center justify-center shrink-0">
                <TbShieldCheck size={22} />
              </div>
              <div>
                <h4 className="font-display font-extrabold uppercase text-xs tracking-wider text-white">
                  100% Origen Cooperativo
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Vinos, chocolates, cacao y café con trazabilidad y calidad garantizada.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-2">
              <div className="w-11 h-11 bg-[#141414] border border-[#262626] text-[#de2a2a] flex items-center justify-center shrink-0">
                <TbCreditCard size={22} />
              </div>
              <div>
                <h4 className="font-display font-extrabold uppercase text-xs tracking-wider text-white">
                  Pago Seguro Culqi
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Tarjetas de crédito, débito, Yape o Plin con protección antifraude.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-2">
              <div className="w-11 h-11 bg-[#141414] border border-[#262626] text-[#de2a2a] flex items-center justify-center shrink-0">
                <TbHeadset size={22} />
              </div>
              <div>
                <h4 className="font-display font-extrabold uppercase text-xs tracking-wider text-white">
                  Atención Personalizada
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Asesoría directa para eventos, regalos corporativos y pedidos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation & Brand Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-7 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1 & 2: Identidad, Newsletter y Contacto */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 group">
                {company?.logoUrl ? (
                  <div className="h-9 flex items-center justify-center overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={company.logoUrl}
                      alt={brandName}
                      className="h-full w-auto max-w-[50px] object-contain"
                    />
                  </div>
                ) : null}
                <span className="font-display text-white font-extrabold uppercase text-2xl tracking-tight">
                  {brandName}
                </span>
              </Link>
              <p className="text-xs text-neutral-400 leading-relaxed mt-2.5 max-w-sm">
                {company?.slogan ||
                  'Vinos, chocolates finos, derivados del cacao y café de especialidad elaborados por nuestra cooperativa con envío a todo el Perú.'}
              </p>
            </div>

            {/* Newsletter */}
            <div className="p-4 bg-[#0d0d0d] border border-[#262626] max-w-md">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-white block mb-1">
                Boletín de novedades y ofertas
              </span>
              <p className="text-[11px] text-neutral-400 mb-3">
                Recibe promociones exclusivas en vinos, chocolates, cacao y café.
              </p>

              {newsletterSubscribed ? (
                <div className="flex items-center gap-2 p-2.5 bg-[#2e9e7b]/15 border border-[#2e9e7b]/40 text-xs text-emerald-300">
                  <TbCheck size={16} className="text-[#2e9e7b] shrink-0" />
                  <span>¡Gracias por suscribirte! Te enviaremos nuestras novedades.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex">
                  <div className="relative flex-1">
                    <TbMail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                      size={16}
                    />
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Ingresa tu correo electrónico"
                      className="w-full bg-black border border-[#333333] rounded-none py-2.5 pl-9 pr-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#de2a2a] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#de2a2a] hover:bg-red-700 text-white font-bold uppercase tracking-wider text-[11px] px-4 rounded-none transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Unirme <TbChevronRight size={14} />
                  </button>
                </form>
              )}
              <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-neutral-500">
                <TbLock size={12} className="shrink-0" />
                <span>Sin spam. Puedes darte de baja cuando quieras.</span>
              </div>
            </div>

            {/* Canales de Contacto */}
            <div className="space-y-2.5 text-xs">
              <span className="font-display font-bold text-white text-xs uppercase tracking-wider block">
                Atención y Contacto
              </span>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-[#141414] border border-[#262626] flex items-center justify-center text-[#de2a2a] shrink-0">
                  <TbBrandWhatsapp size={14} />
                </div>
                <span className="text-neutral-400">WhatsApp / Teléfono:</span>
                <a
                  href={`tel:${cleanPhone}`}
                  className="font-semibold text-white hover:text-[#de2a2a] transition-colors"
                >
                  {rawPhone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-[#141414] border border-[#262626] flex items-center justify-center text-[#de2a2a] shrink-0">
                  <TbMail size={14} />
                </div>
                <span className="text-neutral-400">Correo:</span>
                <a
                  href={`mailto:${company?.email || 'soporte@mitienda.com'}`}
                  className="font-semibold text-white hover:text-[#de2a2a] transition-colors"
                >
                  {company?.email || 'soporte@mitienda.com'}
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 bg-[#141414] border border-[#262626] flex items-center justify-center text-[#de2a2a] shrink-0 mt-0.5">
                  <TbMapPin size={14} />
                </div>
                <span className="text-neutral-400">Ubicación:</span>
                <span className="font-semibold text-white">
                  {company?.address || 'Lima, Perú'}
                </span>
              </div>
            </div>
          </div>

          {/* Col 3: Empresa y Legal */}
          <div>
            <h5 className="font-display font-bold text-xs uppercase tracking-wider text-white mb-4">
              Nuestra Empresa
            </h5>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/ayuda" className="hover:text-white transition-colors">
                  Quiénes somos
                </Link>
              </li>
              <li>
                <Link href="/terminos-y-condiciones" className="hover:text-white transition-colors font-medium text-neutral-300">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-white transition-colors">
                  Políticas de privacidad
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-white transition-colors">
                  Marcas oficiales
                </Link>
              </li>
              <li>
                <Link href="/mis-compras" className="hover:text-white transition-colors">
                  Mis compras
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Servicio al Cliente */}
          <div>
            <h5 className="font-display font-bold text-xs uppercase tracking-wider text-white mb-4">
              Servicio al Cliente
            </h5>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/ayuda" className="hover:text-white transition-colors">
                  Centro de ayuda
                </Link>
              </li>
              <li>
                <Link href="/rastreo" className="hover:text-white transition-colors font-medium text-neutral-300">
                  Rastrea tu pedido
                </Link>
              </li>
              <li>
                <Link href="/ayuda" className="hover:text-white transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="hover:text-white transition-colors font-medium text-neutral-300">
                  Cambios y devoluciones
                </Link>
              </li>
              <li>
                <Link
                  href="/libro-de-reclamaciones"
                  className="hover:text-white transition-colors font-bold text-white flex items-center gap-1.5 pt-1"
                >
                  <TbBook size={14} className="text-[#de2a2a]" />
                  <span>Libro de Reclamaciones</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Categorías */}
          <div>
            <h5 className="font-display font-bold text-xs uppercase tracking-wider text-white mb-4">
              Catálogo
            </h5>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              {categories.slice(0, 6).map((cat) => (
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
                <Link href="/categories" className="hover:text-white font-semibold text-neutral-300 transition-colors">
                  Ver todo el catálogo
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="hover:text-red-400 transition-colors text-[#de2a2a] font-bold uppercase">
                  Ofertas especiales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Zonas de Delivery */}
        <div className="mt-10 pt-6 border-t border-[#262626] text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">
            Zonas de Delivery • {brandName}
          </p>
          <p className="text-[11px] text-neutral-500 leading-relaxed max-w-4xl mx-auto">
            {DELIVERY_ZONES.join(' · ')}
          </p>
        </div>
      </div>

      {/* 3. Métodos de Pago y Certificaciones */}
      <div className="bg-[#080808] border-t border-[#262626] py-5">
        <div className="max-w-7xl mx-auto px-4 md:px-7 flex flex-col lg:flex-row items-center justify-between gap-5 text-xs text-neutral-400">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="text-[11px] font-bold text-white mr-1 uppercase tracking-wider">
              Métodos de Pago:
            </span>
            {['Visa', 'Mastercard', 'Amex', 'Yape', 'Plin', 'PagoEfectivo', 'Transferencia'].map(
              (method) => (
                <span
                  key={method}
                  className="px-2.5 py-1 bg-[#141414] border border-[#262626] text-[11px] font-medium text-neutral-300"
                >
                  {method}
                </span>
              ),
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <TbReceiptTax size={15} className="text-[#2e9e7b]" />
              <span>Boleta y Factura Electrónica SUNAT</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <TbShieldLock size={15} className="text-[#de2a2a]" />
              <span>Cifrado SSL 256 bits Seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sub-footer Legal, Libro INDECOPI, Advertencia +18 y Redes Sociales */}
      <div className="bg-black border-t border-[#262626] py-6 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 md:px-7 space-y-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="text-center md:text-left space-y-1">
              <p className="text-neutral-400">
                Copyright © {new Date().getFullYear()}{' '}
                <span className="text-white font-semibold">
                  {company?.legalName || brandName}
                </span>
                . Todos los derechos reservados.
              </p>
              <p className="text-[11px] text-neutral-500">
                <span>{company?.legalName || brandName}</span>
                {company?.taxId ? <span> • RUC: {company.taxId}</span> : null}
              </p>
            </div>

            <Link
              href="/libro-de-reclamaciones"
              className="flex items-center gap-3 px-4 py-2 bg-[#0d0d0d] border border-[#262626] hover:border-[#de2a2a] transition-colors group shrink-0"
              title="Libro de Reclamaciones Virtual conforme a las disposiciones de INDECOPI (Ley N° 29571)"
            >
              <div className="w-8 h-8 bg-[#de2a2a]/15 text-[#de2a2a] flex items-center justify-center shrink-0">
                <TbBook size={18} />
              </div>
              <div className="text-left">
                <span className="font-bold text-white text-[11px] block leading-none uppercase tracking-wide">
                  Libro de Reclamaciones
                </span>
                <span className="text-[10px] text-neutral-400 block leading-none mt-1">
                  Virtual • INDECOPI
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2.5">
              {validFacebook && (
                <a
                  href={validFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Oficial"
                  className="w-9 h-9 bg-[#141414] hover:bg-[#de2a2a] text-neutral-300 hover:text-white border border-[#262626] flex items-center justify-center transition-colors"
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
                  className="w-9 h-9 bg-[#141414] hover:bg-[#de2a2a] text-neutral-300 hover:text-white border border-[#262626] flex items-center justify-center transition-colors"
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
                  className="w-9 h-9 bg-[#141414] hover:bg-[#de2a2a] text-neutral-300 hover:text-white border border-[#262626] flex items-center justify-center transition-colors"
                >
                  <TbBrandTiktok size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Cintillo Legal Obligatorio */}
          <div className="pt-4 border-t border-[#1c1c1c] text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white">
              VENTA DE VINOS Y BEBIDAS ALCOHÓLICAS EXCLUSIVA PARA MAYORES DE 18 AÑOS. TOMAR BEBIDAS ALCOHÓLICAS EN EXCESO ES DAÑINO.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

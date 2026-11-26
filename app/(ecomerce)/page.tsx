'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { TbArrowRight, TbCheck, TbCoffee, TbMail, TbSparkles } from 'react-icons/tb';
import { MainCarousel } from './_components/MainCarousel';
import { ProductCarousel } from './_components/ProductCarousel';
import { CategoryCarousel } from './_components/CategoryCarousel';
import { BrandsCarousel } from './_components/BrandsCarousel';
import { useProductStore } from '@/stores/product.store';
import { useCategoryStore } from '@/stores/category.store';
import { useRecentlyViewedStore } from '@/stores/recently-viewed.store';
import { Product } from '@/types/product.types';

const EDITORIAL_GUIDES = [
  {
    tag: 'MARIDAJE VINO & CACAO',
    title: 'Cómo combinar vinos tintos de la cooperativa con chocolate fino de aroma',
    excerpt: 'Descubre qué porcentaje de cacao realza mejor las notas frutales y taninos de cada vino.',
    href: '/search?q=chocolate',
  },
  {
    tag: 'DERIVADOS DEL CACAO',
    title: 'Nibs, pasta pura y manteca de cacao: usos en cocina y pastelería',
    excerpt: 'Conoce los beneficios antioxidantes y las preparaciones ideales con derivados artesanales.',
    href: '/search?q=cacao',
  },
  {
    tag: 'CAFÉ DE ESPECIALIDAD',
    title: 'Guía de molienda y extracción para disfrutar tu café de origen en casa',
    excerpt: 'Prensa francesa, V60 o cafetera italiana: logra una taza equilibrada y aromática.',
    href: '/search?q=cafe',
  },
];

export default function Ecomerce() {
  const { products, fetchProducts } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { viewedIds } = useRecentlyViewedStore();
  const [mounted, setMounted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.isActive !== false);
  }, [products]);

  // Nuevas Joyas / Novedades (últimos agregados)
  const newArrivals = useMemo(() => {
    return activeProducts.slice(0, 12);
  }, [activeProducts]);

  // Vistos recientemente desde localStorage
  const recentlyViewedProducts = useMemo(() => {
    if (!mounted || !viewedIds || viewedIds.length === 0 || activeProducts.length === 0) {
      return [];
    }
    return viewedIds
      .map((id) => activeProducts.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [mounted, viewedIds, activeProducts]);

  // Productos en oferta
  const dealProducts = useMemo(() => {
    return activeProducts.filter(
      (p) =>
        (p.discount && p.discount > 0) ||
        (p.originalPrice && p.originalPrice > p.price),
    );
  }, [activeProducts]);

  const featuredOfferProducts = useMemo(() => {
    if (dealProducts.length >= 4) {
      return dealProducts.slice(0, 4);
    }
    const nonDeal = activeProducts.filter(
      (p) => !dealProducts.some((d) => d.id === p.id),
    );
    return [...dealProducts, ...nonDeal].slice(0, 4);
  }, [dealProducts, activeProducts]);

  // Colecciones dinámicas por categoría real de la BD (máximo 4 filas editoriales)
  const categorySections = useMemo(() => {
    const groups: {
      id: string;
      name: string;
      href: string;
      items: Product[];
    }[] = [];

    categories.forEach((cat) => {
      const catItems = activeProducts.filter((p) => p.categoryId === cat.id);
      if (catItems.length > 0) {
        groups.push({
          id: cat.id,
          name: cat.name,
          href: cat.href || `/category/${cat.id}`,
          items: catItems.slice(0, 12),
        });
      }
    });

    return groups.slice(0, 4);
  }, [categories, activeProducts]);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterSent(true);
    setNewsletterEmail('');
  };

  return (
    <div className="bg-white text-[#020202]">
      {/* 1. Slideshow Hero */}
      <MainCarousel />

      {/* 2. Nuevas Joyas / Novedades */}
      {newArrivals.length > 0 && (
        <div className="border-b border-[#ebebeb]">
          <ProductCarousel
            eyebrow="ENTÉRATE DE LAS NOVEDADES"
            title="NUEVAS JOYAS"
            products={newArrivals}
            scrollable
            headerAction={{
              label: 'VER TODO',
              href: '/search',
            }}
          />
        </div>
      )}

      {/* 3. Bloque Rich-Text Editorial */}
      <section className="py-12 px-4 md:px-7 border-b border-[#ebebeb] bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-accent">
            <TbSparkles size={14} />
            <span>DE NUESTRA COOPERATIVA A TU MESA</span>
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-black leading-tight">
            VINOS, CHOCOLATES, CACAO Y CAFÉ DE ORIGEN
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Selección artesanal de vinos, chocolates finos, derivados del cacao y café de especialidad producidos con compromiso y trazabilidad, con envío rápido en Lima y despachos a todo el Perú.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ofertas"
              className="px-7 py-3 bg-brand-accent hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-none transition-colors"
            >
              VER OFERTAS
            </Link>
            <Link
              href="/categories"
              className="px-7 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest rounded-none transition-colors"
            >
              VER CATÁLOGO
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Categorías */}
      <div className="border-b border-[#ebebeb]">
        <CategoryCarousel title="EXPLORA POR CATEGORÍA" />
      </div>

      {/* 5. Colecciones dinámicas por categoría real */}
      {categorySections.length > 0 ? (
        categorySections.map((sec) => (
          <div key={sec.id} className="border-b border-[#ebebeb]">
            <ProductCarousel
              eyebrow="SELECCIÓN DE ORIGEN"
              title={sec.name}
              products={sec.items}
              scrollable
              headerAction={{
                label: 'VER TODO',
                href: sec.href,
              }}
            />
          </div>
        ))
      ) : (
        activeProducts.length > 0 && (
          <div className="border-b border-[#ebebeb]">
            <ProductCarousel
              eyebrow="SELECCIÓN DE ORIGEN"
              title="DESCUBRE NUESTRO CATÁLOGO"
              products={activeProducts.slice(0, 12)}
              scrollable
              headerAction={{
                label: 'VER TODO',
                href: '/search',
              }}
            />
          </div>
        )
      )}

      {/* 6. Bloque Negro de Alto Contraste: Ofertas Exclusivas */}
      {featuredOfferProducts.length > 0 && (
        <div className="bg-black py-4 border-y border-[#262626]">
          <ProductCarousel
            eyebrow="PROMOCIONES DE LA SEMANA"
            title="OFERTAS EXCLUSIVAS"
            products={featuredOfferProducts}
            variant="featured"
            darkSurface
            headerAction={{
              label: 'VER TODAS LAS OFERTAS',
              href: '/ofertas',
            }}
          />
        </div>
      )}

      {/* 7. Basado en tu última visita */}
      {mounted && recentlyViewedProducts.length > 0 && (
        <div className="border-b border-[#ebebeb]">
          <ProductCarousel
            eyebrow="RECOMENDADOS PARA TI"
            title="BASADO EN TU ÚLTIMA VISITA"
            products={recentlyViewedProducts}
            headerAction={{
              label: 'VER HISTORIAL',
              href: '/historial',
            }}
          />
        </div>
      )}

      {/* 8. Marcas */}
      <div className="border-b border-[#ebebeb]">
        <BrandsCarousel title="LAS MEJORES MARCAS" />
      </div>

      {/* 9. Guías & Maridajes (Sección Editorial) */}
      <section className="max-w-7xl mx-auto py-12 px-4 md:px-7 border-b border-[#ebebeb]">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-brand-accent mb-1">
              CULTURA & MARIDAJE
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black leading-none">
              GUÍAS Y MARIDAJES
            </h2>
          </div>
          <Link
            href="/categories"
            className="text-xs font-bold uppercase tracking-widest text-black hover:text-brand-accent underline underline-offset-4 transition-colors shrink-0"
          >
            EXPLORAR CATÁLOGO
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {EDITORIAL_GUIDES.map((guide) => (
            <Link
              key={guide.title}
              href={guide.href}
              className="group border border-[#e5e5e5] hover:border-black bg-white p-6 flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] px-2.5 py-1 bg-black text-white group-hover:bg-brand-accent transition-colors">
                    {guide.tag}
                  </span>
                  <TbCoffee size={20} className="text-neutral-400 group-hover:text-black transition-colors" />
                </div>
                <h3 className="font-display font-extrabold uppercase text-base sm:text-lg text-black leading-snug group-hover:text-brand-accent transition-colors">
                  {guide.title}
                </h3>
                <p className="text-xs text-neutral-600 mt-2.5 leading-relaxed">
                  {guide.excerpt}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#efefef] inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black group-hover:text-brand-accent">
                <span>VER PRODUCTOS RELACIONADOS</span>
                <TbArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 10. Banner Newsletter de Ofertas */}
      <section className="bg-[#f5f5f5] py-12 px-4 md:px-7">
        <div className="max-w-3xl mx-auto bg-white border border-[#d9d9d9] p-7 sm:p-10 text-center space-y-4">
          <div className="w-11 h-11 bg-brand-accent text-white flex items-center justify-center mx-auto">
            <TbMail size={22} />
          </div>
          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-brand-accent">
            CLUB DE OFERTAS
          </span>
          <h2 className="font-display text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-black">
            RECIBE OFERTAS Y PROMOCIONES PERSONALIZADAS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto">
            Entérate antes que nadie de nuevos ingresos, cosechas especiales y descuentos exclusivos de nuestra cooperativa.
          </p>

          {newsletterSent ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 bg-[#2e9e7b]/10 border border-[#2e9e7b]/40 text-[#2e9e7b] text-xs font-bold uppercase tracking-wider">
              <TbCheck size={16} />
              <span>¡Gracias! Te enviaremos nuestras mejores promociones.</span>
            </div>
          ) : (
            <form
              onSubmit={handleNewsletter}
              className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2"
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Tu correo electrónico..."
                className="flex-1 h-11 px-4 bg-white border border-[#d9d9d9] focus:border-black outline-none text-xs text-black rounded-none"
              />
              <button
                type="submit"
                className="h-11 px-6 bg-brand-accent hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-none transition-colors cursor-pointer shrink-0"
              >
                SUSCRIBIRME
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

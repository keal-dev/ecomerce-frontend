'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { TbArrowRight, TbChevronLeft, TbChevronRight } from 'react-icons/tb';
import { useBannerStore } from '@/stores/banner.store';
import { Banner, BannerButtonPosition } from '@/types/banner.types';

function getButtonOverlayClasses(position?: BannerButtonPosition): string {
  switch (position) {
    case 'bottom-center':
      return 'items-end justify-center px-6 pb-11 sm:pb-14';
    case 'bottom-right':
      return 'items-end justify-end pl-6 pr-6 sm:pr-16 pb-11 sm:pb-14';
    case 'center':
      return 'items-center justify-center p-6';
    case 'bottom-left':
    default:
      return 'items-end justify-start pl-6 sm:pl-16 pr-6 pb-11 sm:pb-14';
  }
}

export const MainCarousel = () => {
  const { banners, fetchBanners } = useBannerStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchBanners({ type: 'hero', isActive: true });
  }, [fetchBanners]);

  const activeHeroBanners = useMemo(() => {
    return banners.filter(
      (b): b is Banner & { imageUrl: string } =>
        b.type === 'hero' && b.isActive && Boolean(b.imageUrl),
    );
  }, [banners]);

  const totalSlides = activeHeroBanners.length > 0 ? activeHeroBanners.length : 1;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev <= 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  useEffect(() => {
    if (!isHovered && totalSlides > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [nextSlide, isHovered, totalSlides]);

  // Si cambia el total de slides y el slide actual está fuera de rango, resetear
  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [totalSlides, currentSlide]);

  return (
    <div
      className="relative w-full h-[260px] sm:h-[330px] md:h-[390px] lg:h-[420px] group overflow-hidden bg-brand-primary"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carrusel Deslizante */}
      <div
        className="flex w-full h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {activeHeroBanners.length > 0 ? (
          activeHeroBanners.map((banner) => {
            const hasLink = Boolean(banner.linkUrl);
            const isButtonMode = hasLink && banner.linkMode === 'button';
            const isExternal = hasLink && /^https?:\/\//i.test(banner.linkUrl!);
            const ctaClasses =
              'pointer-events-auto inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-primary text-white font-bold text-[11px] sm:text-xs uppercase tracking-[0.16em] px-6 sm:px-8 py-3 sm:py-3.5 rounded-none border border-white/15 shadow-xl transition-colors duration-200';

            return (
              <div key={banner.id} className="min-w-full h-full flex-shrink-0 relative">
                {hasLink && !isButtonMode ? (
                  isExternal ? (
                    <a
                      href={banner.linkUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full block cursor-pointer select-none"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={banner.imageUrl || ''}
                        alt={banner.title}
                        className="w-full h-full object-cover object-center"
                        draggable={false}
                      />
                    </a>
                  ) : (
                    <Link
                      href={banner.linkUrl!}
                      className="w-full h-full block cursor-pointer select-none"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={banner.imageUrl || ''}
                        alt={banner.title}
                        className="w-full h-full object-cover object-center"
                        draggable={false}
                      />
                    </Link>
                  )
                ) : (
                  <div className="w-full h-full block select-none relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={banner.imageUrl || ''}
                      alt={banner.title}
                      className="w-full h-full object-cover object-center"
                      draggable={false}
                    />

                    {isButtonMode && (
                      <div
                        className={`absolute inset-0 z-10 pointer-events-none flex ${getButtonOverlayClasses(
                          banner.buttonPosition,
                        )}`}
                      >
                        {isExternal ? (
                          <a
                            href={banner.linkUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={ctaClasses}
                          >
                            <span>{banner.buttonText || 'Ver más'}</span>
                            <TbArrowRight size={15} />
                          </a>
                        ) : (
                          <Link href={banner.linkUrl!} className={ctaClasses}>
                            <span>{banner.buttonText || 'Ver más'}</span>
                            <TbArrowRight size={15} />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* Slide de respaldo editorial cooperativa gourmet */
          <div className="min-w-full h-full flex-shrink-0 bg-gradient-to-br from-black via-[#121212] to-[#230909] flex items-center justify-center relative">
            <div className="max-w-4xl mx-auto px-6 text-center text-white">
              <span className="inline-block px-3 py-1 bg-brand-accent text-white text-[11px] font-bold mb-4 uppercase tracking-[0.2em]">
                PRODUCTOS DE ORIGEN • DELIVERY EN LIMA Y PERÚ
              </span>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight uppercase leading-none">
                VINOS, CHOCOLATES, CACAO Y CAFÉ DE ORIGEN
              </h1>
              <p className="text-sm md:text-base mb-8 font-normal text-neutral-300 max-w-xl mx-auto">
                Vinos seleccionados, chocolates finos, derivados del cacao y café de especialidad elaborados por nuestra cooperativa con entrega rápida y comprobante electrónico.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/categories"
                  className="inline-block bg-brand-accent hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded-none transition-colors"
                >
                  EXPLORAR CATÁLOGO
                </Link>
                <Link
                  href="/ofertas"
                  className="inline-block bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded-none transition-colors"
                >
                  VER OFERTAS
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flechas de navegación editoriales cuadradas */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white text-black hover:bg-brand-accent hover:text-white border border-black/15 w-11 h-11 flex items-center justify-center rounded-none shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            aria-label="Anterior slide"
          >
            <TbChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white text-black hover:bg-brand-accent hover:text-white border border-black/15 w-11 h-11 flex items-center justify-center rounded-none shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            aria-label="Siguiente slide"
          >
            <TbChevronRight className="w-5 h-5" />
          </button>

          {/* Barras indicadoras inferiores */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 rounded-none transition-all duration-300 cursor-pointer ${
                  currentSlide === index
                    ? 'bg-brand-accent w-8'
                    : 'bg-white/60 hover:bg-white w-5'
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

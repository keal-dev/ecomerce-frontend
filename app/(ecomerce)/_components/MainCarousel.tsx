'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { TbChevronLeft, TbChevronRight } from 'react-icons/tb';
import { useBannerStore } from '@/stores/banner.store';
import { Banner } from '@/types/banner.types';

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
      className="relative w-full h-[320px] sm:h-[390px] md:h-[460px] lg:h-[480px] group overflow-hidden bg-brand/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carrusel Deslizante */}
      <div
        className="flex w-full h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {activeHeroBanners.length > 0 ? (
          activeHeroBanners.map((banner) => (
            <div key={banner.id} className="min-w-full h-full flex-shrink-0 relative">
              {banner.linkUrl ? (
                <Link
                  href={banner.linkUrl}
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
              ) : (
                <div className="w-full h-full block select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl || ''}
                    alt={banner.title}
                    className="w-full h-full object-cover object-center"
                    draggable={false}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          /* Slide de respaldo por defecto cuando aún no se suben banners */
          <div className="min-w-full h-full flex-shrink-0 bg-brand flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-6 text-center text-[#333]">
              <span className="inline-block px-3 py-1 bg-white/80 rounded-full text-xs font-bold mb-3 uppercase tracking-wider text-gray-800">
                Bienvenido a nuestra tienda
              </span>
              <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">
                Las mejores ofertas y promociones
              </h1>
              <p className="text-sm md:text-lg mb-6 font-medium text-gray-700">
                Envíos a todo el país y compras seguras en cuotas.
              </p>
              <Link
                href="/categories"
                className="inline-block bg-[#3483fa] hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all"
              >
                Explorar Catálogo
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Degradado inferior para fundir con el fondo de la página */}
      <div className="absolute bottom-0 left-0 w-full h-16 md:h-24 bg-gradient-to-t from-[#ebebeb] to-transparent pointer-events-none z-10" />

      {/* Flechas de navegación (solo si hay más de 1 slide) */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-3 group-hover:translate-x-0 cursor-pointer"
            aria-label="Anterior slide"
          >
            <TbChevronLeft className="w-5 h-5 md:w-7 md:h-7" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-3 group-hover:translate-x-0 cursor-pointer"
            aria-label="Siguiente slide"
          >
            <TbChevronRight className="w-5 h-5 md:w-7 md:h-7" />
          </button>

          {/* Indicadores de Puntos */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === index
                    ? 'bg-[#3483fa] w-6'
                    : 'bg-white/70 hover:bg-white w-2 shadow-xs'
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

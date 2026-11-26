'use client';

import React, { useEffect, useState } from 'react';
import { TbShieldCheck, TbAlertTriangle } from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';

const STORAGE_KEY = 'store_age_verified_18';

export const AgeGateModal = () => {
  const { company } = useCompanyStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const verified = localStorage.getItem(STORAGE_KEY);
      if (verified !== 'true') {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleConfirm = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore storage errors
    }
    setDenied(false);
    setIsOpen(false);
  };

  if (!mounted || !isOpen) return null;

  const brandName = company?.name || 'NUESTRA LICORERÍA';

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="w-full max-w-md bg-white text-[#020202] border border-[#262626] shadow-2xl overflow-hidden">
        {/* Cabecera Negra */}
        <div className="bg-black text-white px-6 py-5 text-center border-b border-[#262626]">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#de2a2a] text-white font-display font-extrabold text-lg mb-3">
            +18
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            {brandName}
          </p>
          <h2
            id="age-gate-title"
            className="font-display font-extrabold uppercase text-xl sm:text-2xl tracking-tight mt-1 text-white"
          >
            ¿Eres mayor de edad?
          </h2>
        </div>

        {/* Contenido */}
        <div className="p-6 text-center space-y-5">
          {denied ? (
            <div className="p-4 bg-[#fff5f5] border border-[#de2a2a]/40 text-left space-y-2">
              <div className="flex items-center gap-2 text-[#de2a2a] font-bold text-xs uppercase">
                <TbAlertTriangle size={18} />
                <span>Acceso Restringido</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                Por disposición legal, la venta y exhibición de bebidas alcohólicas está prohibida para menores de 18 años en el Perú.
              </p>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              Para ingresar y comprar en nuestra tienda de licores debes confirmar que tienes{' '}
              <strong className="text-black">18 años o más</strong>.
            </p>
          )}

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full h-12 bg-[#de2a2a] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest transition-colors rounded-none cursor-pointer flex items-center justify-center gap-2"
            >
              <TbShieldCheck size={18} />
              <span>SÍ, SOY MAYOR DE 18 AÑOS</span>
            </button>

            <button
              type="button"
              onClick={() => setDenied(true)}
              className="w-full h-10 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest transition-colors rounded-none cursor-pointer"
            >
              SOY MENOR DE EDAD
            </button>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 pt-2 border-t border-[#e5e5e5] leading-relaxed">
            TOMAR BEBIDAS ALCOHÓLICAS EN EXCESO ES DAÑINO. PROHIBIDA LA VENTA A MENORES DE 18 AÑOS.
          </p>
        </div>
      </div>
    </div>
  );
};

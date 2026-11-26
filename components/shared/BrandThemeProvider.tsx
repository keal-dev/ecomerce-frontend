'use client';

import React, { useEffect } from 'react';
import { useCompanyStore } from '@/stores/company.store';

const THEME_CACHE_KEY = 'brand_theme_colors';
const DEFAULT_PRIMARY = '#000000';
const DEFAULT_ACCENT = '#de2a2a';

function applyThemeVariables(primary: string, accent: string) {
  document.documentElement.style.setProperty('--brand-primary', primary);
  document.documentElement.style.setProperty('--brand-accent', accent);
}

export function BrandThemeProvider({ children }: { children: React.ReactNode }) {
  const { company, fetchCompany } = useCompanyStore();

  useEffect(() => {
    try {
      const cached = localStorage.getItem(THEME_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { primary?: string; accent?: string };
        const primary =
          parsed.primary && parsed.primary.toLowerCase() !== '#ffe600'
            ? parsed.primary
            : DEFAULT_PRIMARY;
        const accent = parsed.accent || DEFAULT_ACCENT;
        applyThemeVariables(primary, accent);
      }
    } catch {
      // Ignorar cache inválido
    }
    fetchCompany();
  }, [fetchCompany]);

  useEffect(() => {
    if (!company) return;
    const primary =
      company.primaryColor && company.primaryColor.toLowerCase() !== '#ffe600'
        ? company.primaryColor
        : DEFAULT_PRIMARY;
    const accent = company.accentColor || DEFAULT_ACCENT;

    applyThemeVariables(primary, accent);

    try {
      localStorage.setItem(THEME_CACHE_KEY, JSON.stringify({ primary, accent }));
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [company]);

  return <>{children}</>;
}

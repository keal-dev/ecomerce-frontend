'use client';

import React, { useEffect } from 'react';
import { useCompanyStore } from '@/stores/company.store';

export function BrandThemeProvider({ children }: { children: React.ReactNode }) {
  const { company, fetchCompany } = useCompanyStore();

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  useEffect(() => {
    if (company?.primaryColor) {
      document.documentElement.style.setProperty('--brand-primary', company.primaryColor);
    }
  }, [company?.primaryColor]);

  return <>{children}</>;
}

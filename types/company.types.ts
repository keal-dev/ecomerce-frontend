export interface Company {
  id: string;
  name: string;
  legalName?: string;
  taxId?: string;
  logoUrl?: string;
  logoPublicId?: string;
  primaryColor: string;
  accentColor?: string;
  slogan?: string;
  email?: string;
  phone?: string;
  address?: string;
  currency: string;
  currencySymbol: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  boletaSeries?: string;
  facturaSeries?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanyDto {
  name?: string;
  legalName?: string;
  taxId?: string;
  logoUrl?: string;
  logoPublicId?: string;
  primaryColor?: string;
  accentColor?: string;
  slogan?: string;
  email?: string;
  phone?: string;
  address?: string;
  currency?: string;
  currencySymbol?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  boletaSeries?: string;
  facturaSeries?: string;
}

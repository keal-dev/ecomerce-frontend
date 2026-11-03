export interface Company {
  id: string;
  name: string;
  legalName?: string;
  taxId?: string;
  logoUrl?: string;
  logoPublicId?: string;
  primaryColor: string;
  slogan?: string;
  email?: string;
  phone?: string;
  address?: string;
  currency: string;
  currencySymbol: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
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
  slogan?: string;
  email?: string;
  phone?: string;
  address?: string;
  currency?: string;
  currencySymbol?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
}

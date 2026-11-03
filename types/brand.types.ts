export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandDto {
  name: string;
  slug?: string;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  isActive?: boolean;
}

export interface UpdateBrandDto {
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  isActive?: boolean;
}

export interface BrandFilterParams {
  search?: string;
  isActive?: boolean;
}

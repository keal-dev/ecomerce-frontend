import { Category } from './category.types';
import { Brand } from './brand.types';

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku?: string | null;
  price: number;
  originalPrice?: number | null;
  costPrice?: number | null;
  discount?: number | null;
  stock: number;
  imageUrl: string;
  images?: string[];
  description?: string | null;
  features?: string[];
  freeShipping: boolean;
  full: boolean;
  categoryId?: string | null;
  category?: Category | null;
  brandId?: string | null;
  brand?: Brand | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  title: string;
  slug?: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  discount?: number;
  stock?: number;
  imageUrl?: string;
  images?: string[];
  description?: string;
  features?: string[];
  freeShipping?: boolean;
  full?: boolean;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
}

export interface UpdateProductDto {
  title?: string;
  slug?: string;
  sku?: string;
  price?: number;
  originalPrice?: number;
  costPrice?: number;
  discount?: number;
  stock?: number;
  imageUrl?: string;
  images?: string[];
  description?: string;
  features?: string[];
  freeShipping?: boolean;
  full?: boolean;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
}

export interface ProductFilterParams {
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
}

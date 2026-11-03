export interface Category {
  id: string;
  name: string;
  href: string;
  icon?: string;
  badge?: string;
}

export interface CreateCategoryDto {
  name: string;
  href?: string;
  icon?: string;
  badge?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  href?: string;
  icon?: string;
  badge?: string;
}

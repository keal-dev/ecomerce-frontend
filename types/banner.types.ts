export interface Banner {
  id: string;
  title: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  type: string; // 'hero', 'announcement', 'promo'
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerDto {
  title: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  type?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateBannerDto {
  title?: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  type?: string;
  order?: number;
  isActive?: boolean;
}

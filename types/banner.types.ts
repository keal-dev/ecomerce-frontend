export type BannerLinkMode = 'image' | 'button';

export type BannerButtonPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'center';

export interface Banner {
  id: string;
  title: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  linkMode?: BannerLinkMode;
  buttonText?: string | null;
  buttonPosition?: BannerButtonPosition;
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
  linkMode?: BannerLinkMode;
  buttonText?: string | null;
  buttonPosition?: BannerButtonPosition;
  type?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateBannerDto {
  title?: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  linkMode?: BannerLinkMode;
  buttonText?: string | null;
  buttonPosition?: BannerButtonPosition;
  type?: string;
  order?: number;
  isActive?: boolean;
}

import api from '@/libs/axios';
import {
  Banner,
  CreateBannerDto,
  UpdateBannerDto,
} from '@/types/banner.types';

export async function getBannerSlots(): Promise<Banner[]> {
  const response = await api.get<Banner[]>('/banners/slots');
  return response.data;
}

export async function updateBannerSlot(
  order: number,
  dto: UpdateBannerDto,
): Promise<Banner> {
  const response = await api.put<Banner>(`/banners/slots/${order}`, dto);
  return response.data;
}

export async function toggleBannerSlot(order: number): Promise<Banner> {
  const response = await api.patch<Banner>(`/banners/slots/${order}/toggle`);
  return response.data;
}

export async function clearBannerSlot(order: number): Promise<Banner> {
  const response = await api.delete<Banner>(`/banners/slots/${order}/clear`);
  return response.data;
}

export async function reorderBanners(
  items: { id: string; order: number }[],
): Promise<Banner[]> {
  const response = await api.post<Banner[]>('/banners/reorder', { items });
  return response.data;
}

export async function getBanners(params?: {
  type?: string;
  isActive?: boolean;
}): Promise<Banner[]> {
  const response = await api.get<Banner[]>('/banners', { params });
  return response.data;
}

export async function getBannerById(id: string): Promise<Banner> {
  const response = await api.get<Banner>(`/banners/${id}`);
  return response.data;
}

export async function createBanner(dto: CreateBannerDto): Promise<Banner> {
  const response = await api.post<Banner>('/banners', dto);
  return response.data;
}

export async function updateBanner(id: string, dto: UpdateBannerDto): Promise<Banner> {
  const response = await api.put<Banner>(`/banners/${id}`, dto);
  return response.data;
}

export async function toggleBannerActive(id: string): Promise<Banner> {
  const response = await api.patch<Banner>(`/banners/${id}/toggle-active`);
  return response.data;
}

export async function deleteBanner(id: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete<{ success: boolean; message: string }>(`/banners/${id}`);
  return response.data;
}

export async function uploadBannerImage(
  file: File,
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<{ url: string; publicId: string }>(
    '/banners/upload-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
}

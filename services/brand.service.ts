import api from '@/libs/axios';
import {
  Brand,
  CreateBrandDto,
  UpdateBrandDto,
  BrandFilterParams,
} from '@/types/brand.types';

export async function getBrands(params?: BrandFilterParams): Promise<Brand[]> {
  const response = await api.get<Brand[]>('/brands', { params });
  return response.data;
}

export async function getBrandById(id: string): Promise<Brand> {
  const response = await api.get<Brand>(`/brands/${id}`);
  return response.data;
}

export async function createBrand(dto: CreateBrandDto): Promise<Brand> {
  const response = await api.post<Brand>('/brands', dto);
  return response.data;
}

export async function updateBrand(id: string, dto: UpdateBrandDto): Promise<Brand> {
  const response = await api.put<Brand>(`/brands/${id}`, dto);
  return response.data;
}

export async function toggleBrandActive(id: string): Promise<Brand> {
  const response = await api.patch<Brand>(`/brands/${id}/toggle-active`);
  return response.data;
}

export async function deleteBrand(id: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete<{ success: boolean; message: string }>(`/brands/${id}`);
  return response.data;
}

export async function uploadBrandImage(
  file: File,
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<{ url: string; publicId: string }>(
    '/brands/upload-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
}

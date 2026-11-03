import api from '@/libs/axios';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/category.types';

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>('/categories');
  return response.data;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const response = await api.get<Category | null>(`/categories/${id}`);
  return response.data;
}

export async function createCategory(dto: CreateCategoryDto): Promise<Category> {
  const response = await api.post<Category>('/categories', dto);
  return response.data;
}

export async function updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
  const response = await api.put<Category>(`/categories/${id}`, dto);
  return response.data;
}

export async function deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete<{ success: boolean; message: string }>(`/categories/${id}`);
  return response.data;
}

export async function uploadCategoryImage(file: File): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<{ url: string; publicId: string }>('/categories/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

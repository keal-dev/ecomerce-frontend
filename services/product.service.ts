import api from '@/libs/axios';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterParams,
} from '@/types/product.types';

export async function getProducts(params?: ProductFilterParams): Promise<Product[]> {
  const response = await api.get<Product[]>('/products', { params });
  return response.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
}

export async function createProduct(dto: CreateProductDto): Promise<Product> {
  const response = await api.post<Product>('/products', dto);
  return response.data;
}

export async function updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
  const response = await api.put<Product>(`/products/${id}`, dto);
  return response.data;
}

export async function deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete<{ success: boolean; message: string }>(`/products/${id}`);
  return response.data;
}

export async function uploadProductImage(
  file: File,
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<{ url: string; publicId: string }>(
    '/products/upload-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
}

export async function uploadProductImages(
  files: File[],
): Promise<{ url: string; publicId: string }[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  const response = await api.post<{ url: string; publicId: string }[]>(
    '/products/upload-images',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
}

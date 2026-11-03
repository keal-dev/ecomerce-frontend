import api from '@/libs/axios';
import { Purchase, CreatePurchaseDto } from '@/types/purchase.types';

export async function getPurchases(search?: string): Promise<Purchase[]> {
  const response = await api.get<Purchase[]>('/purchases', {
    params: search ? { search } : undefined,
  });
  return response.data;
}

export async function getPurchaseById(id: string): Promise<Purchase> {
  const response = await api.get<Purchase>(`/purchases/${id}`);
  return response.data;
}

export async function createPurchase(dto: CreatePurchaseDto): Promise<Purchase> {
  const response = await api.post<Purchase>('/purchases', dto);
  return response.data;
}

export async function deletePurchase(id: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete<{ success: boolean; message: string }>(`/purchases/${id}`);
  return response.data;
}

import api from '@/libs/axios';
import {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
} from '@/types/supplier.types';

export async function getSuppliers(
  search?: string,
  isActive?: boolean,
): Promise<Supplier[]> {
  const response = await api.get<Supplier[]>('/suppliers', {
    params: {
      search: search || undefined,
      isActive: isActive !== undefined ? isActive : undefined,
    },
  });
  return response.data;
}

export async function getSupplierById(id: string): Promise<Supplier> {
  const response = await api.get<Supplier>(`/suppliers/${id}`);
  return response.data;
}

export async function createSupplier(dto: CreateSupplierDto): Promise<Supplier> {
  const response = await api.post<Supplier>('/suppliers', dto);
  return response.data;
}

export async function updateSupplier(
  id: string,
  dto: UpdateSupplierDto,
): Promise<Supplier> {
  const response = await api.patch<Supplier>(`/suppliers/${id}`, dto);
  return response.data;
}

export async function deleteSupplier(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/suppliers/${id}`,
  );
  return response.data;
}

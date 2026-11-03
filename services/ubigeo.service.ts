import api from '@/libs/axios';
import { DepartmentItem, ProvinceItem, DistrictItem, Ubigeo } from '@/types/ubigeo.types';

export async function getDepartments(): Promise<DepartmentItem[]> {
  const response = await api.get<DepartmentItem[]>('/ubigeo/departments');
  return response.data;
}

export async function getProvinces(departmentCode: string): Promise<ProvinceItem[]> {
  const response = await api.get<ProvinceItem[]>(`/ubigeo/provinces/${departmentCode}`);
  return response.data;
}

export async function getDistricts(provinceCode: string): Promise<DistrictItem[]> {
  const response = await api.get<DistrictItem[]>(`/ubigeo/districts/${provinceCode}`);
  return response.data;
}

export async function getUbigeoByCode(code: string): Promise<Ubigeo> {
  const response = await api.get<Ubigeo>(`/ubigeo/${code}`);
  return response.data;
}

export async function searchUbigeos(q: string, limit = 20): Promise<Ubigeo[]> {
  const response = await api.get<Ubigeo[]>('/ubigeo/search', {
    params: { q, limit },
  });
  return response.data;
}

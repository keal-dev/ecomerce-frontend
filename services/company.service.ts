import api from '@/libs/axios';
import { Company, UpdateCompanyDto } from '@/types/company.types';

export async function getCompany(): Promise<Company> {
  const response = await api.get<Company>('/company');
  return response.data;
}

export async function updateCompany(dto: UpdateCompanyDto): Promise<Company> {
  const response = await api.put<Company>('/company', dto);
  return response.data;
}

export async function uploadCompanyLogo(file: File): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<{ url: string; publicId: string }>(
    '/company/upload-logo',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}

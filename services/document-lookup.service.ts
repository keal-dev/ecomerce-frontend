import api from '@/libs/axios';
import {
  DniLookupResult,
  RucLookupResult,
} from '@/types/document-lookup.types';

export async function lookupDni(numero: string): Promise<DniLookupResult> {
  const clean = numero.replace(/\D/g, '');
  const response = await api.get<DniLookupResult>(
    `/document-lookup/dni/${encodeURIComponent(clean)}`,
  );
  return response.data;
}

export async function lookupRuc(numero: string): Promise<RucLookupResult> {
  const clean = numero.replace(/\D/g, '');
  const response = await api.get<RucLookupResult>(
    `/document-lookup/ruc/${encodeURIComponent(clean)}`,
  );
  return response.data;
}

import api from '@/libs/axios';
import {
  Claim,
  ClaimFilterParams,
  CreateClaimDto,
  RespondClaimDto,
} from '@/types/claim.types';

export async function createClaim(dto: CreateClaimDto): Promise<Claim> {
  const response = await api.post<Claim>('/claims', dto);
  return response.data;
}

export async function getClaims(params?: ClaimFilterParams): Promise<Claim[]> {
  const response = await api.get<Claim[]>('/claims', { params });
  return response.data;
}

export async function getClaimById(id: string): Promise<Claim> {
  const response = await api.get<Claim>(`/claims/${id}`);
  return response.data;
}

export async function respondClaim(
  id: string,
  dto: RespondClaimDto,
): Promise<Claim> {
  const response = await api.patch<Claim>(`/claims/${id}/respond`, dto);
  return response.data;
}

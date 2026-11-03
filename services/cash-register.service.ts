import api from '@/libs/axios';
import {
  CashSession,
  OpenCashSessionDto,
  CloseCashSessionDto,
} from '@/types/cash-register.types';

export async function getCurrentCashSession(): Promise<CashSession | null> {
  const response = await api.get<CashSession | null>('/cash-register/current');
  return response.data;
}

export async function openCashSession(dto: OpenCashSessionDto): Promise<CashSession> {
  const response = await api.post<CashSession>('/cash-register/open', dto);
  return response.data;
}

export async function closeCashSession(
  id: string,
  dto: CloseCashSessionDto,
): Promise<CashSession> {
  const response = await api.post<CashSession>(`/cash-register/${id}/close`, dto);
  return response.data;
}

export async function getCashSessionHistory(): Promise<CashSession[]> {
  const response = await api.get<CashSession[]>('/cash-register/history');
  return response.data;
}

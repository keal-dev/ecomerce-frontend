import api from '@/libs/axios';
import { CreateChargeDto, ChargeResponse } from '@/types/payment.types';

export async function processCulqiCharge(dto: CreateChargeDto): Promise<ChargeResponse> {
  const response = await api.post<ChargeResponse>('/payments/culqi/charge', dto);
  return response.data;
}


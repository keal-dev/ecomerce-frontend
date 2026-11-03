import { User } from './user.types';

export type CashSessionStatus = 'open' | 'closed';

export interface CashSession {
  id: string;
  openedById: string;
  openedBy?: User;
  closedById?: string | null;
  closedBy?: User | null;
  status: CashSessionStatus;
  initialAmount: number;
  expectedAmount?: number | null;
  actualAmount?: number | null;
  difference?: number | null;
  openedAt: string;
  closedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpenCashSessionDto {
  openedById: string;
  initialAmount: number;
  notes?: string;
}

export interface CloseCashSessionDto {
  closedById: string;
  actualAmount: number;
  expectedAmount?: number;
  notes?: string;
}

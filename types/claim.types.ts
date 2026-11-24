export type ClaimStatus = 'pending' | 'in_review' | 'resolved';

export interface Claim {
  id: string;
  code: string;
  isMinor: boolean;
  tutorName: string | null;
  tutorDocType: string | null;
  tutorDocNumber: string | null;
  tutorPhone: string | null;
  docType: string;
  docNumber: string;
  fullName: string;
  email: string;
  phone: string | null;
  department: string;
  province: string;
  district: string;
  address: string;
  contractType: 'producto' | 'servicio' | string;
  claimedAmount: number | null;
  orderNumber: string | null;
  contractDescription: string;
  claimType: 'reclamo' | 'queja' | string;
  claimDetail: string;
  claimRequest: string;
  status: ClaimStatus;
  adminResponse: string | null;
  respondedAt: string | null;
  respondedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClaimDto {
  isMinor?: boolean;
  tutorName?: string;
  tutorDocType?: string;
  tutorDocNumber?: string;
  tutorPhone?: string;
  docType: string;
  docNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  province: string;
  district: string;
  address: string;
  contractType: 'producto' | 'servicio';
  claimedAmount?: number;
  orderNumber?: string;
  contractDescription: string;
  claimType: 'reclamo' | 'queja';
  claimDetail: string;
  claimRequest: string;
}

export interface RespondClaimDto {
  status: ClaimStatus;
  adminResponse: string;
}

export interface ClaimFilterParams {
  status?: string;
  claimType?: string;
  search?: string;
}

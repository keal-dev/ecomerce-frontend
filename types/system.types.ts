export interface DatabaseTableCounts {
  products: number;
  categories: number;
  brands: number;
  banners: number;
  orders: number;
  purchases: number;
  suppliers: number;
  cashSessions: number;
  claims: number;
  otherUsers: number;
  company: number;
  ubigeos: number;
}

export interface DatabaseStats {
  protectedSuperAdminEmail: string;
  counts: DatabaseTableCounts;
}

export interface ResetDatabaseDto {
  confirmationText: string;
  resetCompany?: boolean;
}

export interface ResetDatabaseResponse {
  success: boolean;
  message: string;
  resetAt: string;
  preservedSuperAdminEmail: string;
  resetCompany: boolean;
  deletedCounts: DatabaseTableCounts;
}

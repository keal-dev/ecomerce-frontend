export interface Supplier {
  id: string;
  name: string;
  documentType?: string | null;
  documentNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  contactName?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  contactName?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {}

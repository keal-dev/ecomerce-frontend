import { Product } from './product.types';

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  product?: Product;
  quantity: number;
  costPrice: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierName: string;
  documentType?: string | null;
  documentNumber?: string | null;
  totalAmount: number;
  notes?: string | null;
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseItemDto {
  productId: string;
  quantity: number;
  costPrice: number;
  newSalePrice?: number;
}

export interface CreatePurchaseDto {
  supplierName: string;
  documentType?: string;
  documentNumber?: string;
  notes?: string;
  items: CreatePurchaseItemDto[];
}

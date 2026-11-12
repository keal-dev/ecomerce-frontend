export type OrderStatus = 'pending' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'failed';

export interface OrderItem {
  id: string;
  productId: string | null;
  productTitle: string;
  productSku: string | null;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  environment: 'test' | 'production';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  docType: string;
  docNumber: string;
  department: string;
  province: string;
  district: string;
  address: string;
  reference: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  currencySymbol: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  culqiChargeId: string | null;
  culqiReferenceCode: string | null;
  invoiceType: string | null;
  companyRuc: string | null;
  companyLegalName: string | null;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  docType?: string;
  docNumber: string;
  department: string;
  province: string;
  district: string;
  address: string;
  reference?: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  currencySymbol?: string;
  paymentMethod: string;
  paymentStatus?: string;
  orderStatus?: string;
  culqiChargeId?: string;
  culqiReferenceCode?: string;
  invoiceType?: string;
  companyRuc?: string;
  companyLegalName?: string;
  notes?: string;
  items: {
    productId?: string;
    title: string;
    sku?: string;
    imageUrl?: string;
    quantity: number;
    price: number;
  }[];
}

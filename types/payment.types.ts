export interface CreateChargeDto {
  tokenId: string;
  amount: number;
  email: string;
  currencyCode: string;
  description?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  phoneNumber?: string;
  docType?: string;
  docNumber?: string;
  department?: string;
  province?: string;
  district?: string;
  orderNumber?: string;
  subtotal?: number;
  shippingCost?: number;
  reference?: string;
  invoiceType?: string;
  companyRuc?: string;
  companyLegalName?: string;
  companyName?: string;
  currencySymbol?: string;
  items?: {
    title: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
}

export interface ChargeResponse {
  success: boolean;
  chargeId: string;
  referenceCode?: string;
  outcome?: any;
  amount: number;
  currencyCode: string;
  message: string;
}


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
    productId?: string;
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
  orderNumber?: string;
  orderId?: string;
  environment?: string;
  outcome?: any;
  amount: number;
  currencyCode: string;
  invoice?: {
    series?: string;
    number?: string;
    pdfUrl?: string;
    xmlUrl?: string;
    status?: string;
  } | null;
  message: string;
}


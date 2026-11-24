import api from '@/libs/axios';
import { Order, CreateOrderDto } from '@/types/order.types';

export async function getOrders(query?: {
  environment?: string;
  status?: string;
  search?: string;
  email?: string;
  docNumber?: string;
}): Promise<Order[]> {
  const response = await api.get<Order[]>('/orders', { params: query });
  return response.data;
}

export async function getMyOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>('/orders/my-orders');
  return response.data;
}

export async function trackOrder(orderNumber: string): Promise<Order> {
  const response = await api.get<Order>(`/orders/track/${encodeURIComponent(orderNumber)}`);
  return response.data;
}

export async function getOrderById(id: string): Promise<Order> {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
}

export async function createOrder(dto: CreateOrderDto): Promise<Order> {
  const response = await api.post<Order>('/orders', dto);
  return response.data;
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const response = await api.patch<Order>(`/orders/${id}/status`, { status });
  return response.data;
}

export async function emitOrderInvoice(orderId: string): Promise<Order> {
  const response = await api.post<Order>(`/invoicing/orders/${orderId}/emit`);
  return response.data;
}


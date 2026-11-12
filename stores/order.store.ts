import { create } from 'zustand';
import { Order, CreateOrderDto } from '@/types/order.types';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from '@/services/order.service';

interface OrderFilterQuery {
  environment?: string;
  status?: string;
  search?: string;
}

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  fetchOrders: (query?: OrderFilterQuery) => Promise<void>;
  fetchOrderById: (id: string) => Promise<Order>;
  addOrder: (dto: CreateOrderDto) => Promise<Order>;
  changeOrderStatus: (id: string, status: string) => Promise<void>;
  setSelectedOrder: (order: Order | null) => void;
  clearSelected: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  setSelectedOrder: (order: Order | null) => set({ selectedOrder: order }),
  clearSelected: () => set({ selectedOrder: null }),

  fetchOrders: async (query?: OrderFilterQuery) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getOrders(query);
      set({ orders: data, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar lista de pedidos';
      set({ error: message, isLoading: false });
    }
  },

  fetchOrderById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getOrderById(id);
      set({ selectedOrder: data, isLoading: false });
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al obtener detalle del pedido';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  addOrder: async (dto: CreateOrderDto) => {
    set({ isLoading: true, error: null });
    try {
      const newOrder = await createOrder(dto);
      set((state) => ({
        orders: [newOrder, ...state.orders],
        isLoading: false,
      }));
      return newOrder;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al registrar pedido';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  changeOrderStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateOrderStatus(id, status);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? updated : o)),
        selectedOrder: state.selectedOrder?.id === id ? updated : state.selectedOrder,
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al actualizar estado del pedido';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
